import {
  Platform,
  Share,
  ShareContent,
  StyleProp,
  ViewStyle
} from "react-native"
import { MenuView, MenuAction } from "@react-native-menu/menu"
import { Ionicon } from "@components/common/Icons"
import { CurrentUserEvent } from "@shared-models/Event"
import { useFontScale } from "@lib/Fonts"

export type EventDetailsMenuProps = {
  event: Pick<CurrentUserEvent, "userAttendeeStatus" | "host" | "title">
  eventShareContent: () => Promise<ShareContent>
  onCopyEventTapped: () => void
  onReportEventTapped: () => void
  onEditEventTapped: () => void
  onContactHostTapped: () => void
  onInviteFriendsTapped: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * A drop-down menu view that allows the user to perform various miscellaneous
 * actions with respect to the event.
 */
export const EventDetailsMenuView = ({
  event,
  eventShareContent,
  onCopyEventTapped,
  onReportEventTapped,
  onEditEventTapped,
  onContactHostTapped,
  onInviteFriendsTapped,
  style
}: EventDetailsMenuProps) => {
  const callbacks = {
    "copy-event": onCopyEventTapped,
    "report-event": onReportEventTapped,
    "edit-event": onEditEventTapped,
    "contact-host": onContactHostTapped,
    "invite-friends": onInviteFriendsTapped,
    "share-event": async () => {
      Share.share(await eventShareContent())
    }
  } as const
  return (
    <MenuView
      onPressAction={({ nativeEvent }) => {
        callbacks[nativeEvent.event as EventMenuActionID]()
      }}
      actions={formatEventMenuActions(
        event,
        ATTENDEE_STATUS_ACTIONS[event.userAttendeeStatus]
      )}
      shouldOpenOnLongPress={false}
      style={[
        style,
        { width: 44 * useFontScale(), height: 44 * useFontScale() }
      ]}
    >
      <Ionicon name="ellipsis-horizontal" />
    </MenuView>
  )
}

export type EventMenuAction =
  (typeof EVENT_MENU_ACTION)[keyof typeof EVENT_MENU_ACTION]

export type EventMenuActionID = EventMenuAction["id"]

/**
 * Given a list of {@link EventMenuAction}, formats appropriate content from
 * `event` in place of `"%@"` for any of the given menu actions.
 */
export const formatEventMenuActions = (
  event: Pick<CurrentUserEvent, "host">,
  actions: EventMenuAction[]
): MenuAction[] => {
  return actions.map((action) => {
    if (action.id !== "contact-host") return action
    const title = action.title.replace("%@", event.host.username)
    return { ...action, title }
  })
}

export const EVENT_MENU_ACTION = {
  copyEvent: {
    id: "copy-event",
    title: "Copy Event",
    image: Platform.select({
      ios: "doc.on.doc.fill",
      android: "ic_menu_add"
    })
  },
  reportEvent: {
    id: "report-event",
    title: "Report Event",
    image: Platform.select({
      ios: "exclamationmark.bubble.fill"
    }),
    attributes: {
      destructive: true
    }
  },
  editEvent: {
    id: "edit-event",
    title: "Edit",
    image: Platform.select({
      ios: "square.dashed.inset.filled"
    })
  },
  inviteFriends: {
    id: "invite-friends",
    title: "Invite Friends",
    image: Platform.select({
      ios: "person.3.fill"
    })
  },
  shareEvent: {
    id: "share-event",
    title: "Share",
    image: Platform.select({
      ios: "square.and.arrow.up.fill"
    })
  },
  contactHost: {
    id: "contact-host",
    title: "Contact %@",
    image: Platform.select({
      ios: "person.fill"
    })
  }
} as const

const ATTENDEE_STATUS_ACTIONS = {
  hosting: [
    EVENT_MENU_ACTION.copyEvent,
    EVENT_MENU_ACTION.editEvent,
    EVENT_MENU_ACTION.inviteFriends,
    EVENT_MENU_ACTION.shareEvent
  ],
  attending: [
    EVENT_MENU_ACTION.reportEvent,
    EVENT_MENU_ACTION.copyEvent,
    EVENT_MENU_ACTION.contactHost,
    EVENT_MENU_ACTION.inviteFriends,
    EVENT_MENU_ACTION.shareEvent
  ],
  "not-participating": [
    EVENT_MENU_ACTION.reportEvent,
    EVENT_MENU_ACTION.copyEvent,
    EVENT_MENU_ACTION.contactHost,
    EVENT_MENU_ACTION.shareEvent
  ]
} as Readonly<Record<string, EventMenuAction[]>>
