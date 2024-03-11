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
  event: CurrentUserEvent
  eventShareContent: () => Promise<ShareContent>
  onCopyEventTapped: () => void
  onReportEventTapped: () => void
  onBlockHostToggled: () => void
  onContactHostTapped: () => void
  onInviteFriendsTapped: () => void
  onAssignNewHostTapped: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * A drop-down menu view that allows the user to perform various miscellaneous
 * actions with respect to the event.
 *
 * ## Actions Availability
 * - Reporting the event (Attendee, Non-Participant).
 * - Copying the event (All roles).
 * - Contacting host (Attendee, Non-Participant).
 * - Blocking/Unblocking the host (Attendee, Non-Participant).
 * - Sharing the event (All roles).
 * - Inviting friends (Host, Attendee).
 * - Assiging a new host (Host).
 */
export const EventDetailsMenuView = ({
  event,
  eventShareContent,
  onCopyEventTapped,
  onReportEventTapped,
  onBlockHostToggled,
  onContactHostTapped,
  onInviteFriendsTapped,
  onAssignNewHostTapped,
  style
}: EventDetailsMenuProps) => (
  <MenuView
    onPressAction={({ nativeEvent }) => {
      const callbacks = {
        "copy-event": onCopyEventTapped,
        "report-event": onReportEventTapped,
        "contact-host": onContactHostTapped,
        "toggle-block-host": onBlockHostToggled,
        "invite-friends": onInviteFriendsTapped,
        "assign-host": onAssignNewHostTapped,
        "share-event": async () => {
          Share.share(await eventShareContent())
        }
      } as const satisfies Record<EventMenuActionID, () => void>
      callbacks[nativeEvent.event as EventMenuActionID]()
    }}
    actions={formatEventMenuActions(
      event,
      ATTENDEE_STATUS_ACTIONS[event.userAttendeeStatus]
    )}
    shouldOpenOnLongPress={false}
    style={[style, { width: 44 * useFontScale(), height: 44 * useFontScale() }]}
  >
    <Ionicon name="ellipsis-horizontal" />
  </MenuView>
)

export type EventMenuAction =
  (typeof EVENT_MENU_ACTION)[keyof typeof EVENT_MENU_ACTION]

export type EventMenuActionID = EventMenuAction["id"]

/**
 * Given a list of {@link EventMenuAction}, formats appropriate content from
 * `event` in place of `"%@"` for any of the given menu actions.
 */
export const formatEventMenuActions = (
  event: CurrentUserEvent,
  actions: EventMenuAction[]
): MenuAction[] => {
  const formattedActions = actions.map((action) => {
    return {
      ...action,
      title:
        typeof action.title === "function" ? action.title(event) : action.title,
      image:
        typeof action.image === "function" ? action.image(event) : action.image
    }
  })
  return Platform.OS === "ios" ? formattedActions : formattedActions.reverse()
}

type BaseEventMenuAction = Omit<MenuAction, "title" | "image"> & {
  title: string | ((event: CurrentUserEvent) => string)
  image: string | undefined | ((event: CurrentUserEvent) => string | undefined)
}

export const EVENT_MENU_ACTION = {
  copyEvent: {
    id: "copy-event",
    title: "Copy Event",
    image: Platform.select({
      ios: "doc.on.doc.fill",
      android: "ic_menu_crop"
    })
  },
  reportEvent: {
    id: "report-event",
    title: "Report Event",
    image: Platform.select({
      ios: "exclamationmark.bubble.fill",
      android: "ic_menu_report_image"
    }),
    attributes: {
      destructive: true
    }
  },
  inviteFriends: {
    id: "invite-friends",
    title: "Invite Friends",
    image: Platform.select({
      ios: "person.3.fill",
      android: "ic_menu_send"
    })
  },
  shareEvent: {
    id: "share-event",
    title: "Share Event",
    image: Platform.select({
      ios: "square.and.arrow.up.fill",
      android: "ic_menu_share"
    })
  },
  contactHost: {
    id: "contact-host",
    title: (event) => `Contact ${event.host.username}`,
    image: Platform.select({
      ios: "person.fill",
      android: "ic_menu_call"
    })
  },
  assignHost: {
    id: "assign-host",
    title: "Assign New Host",
    image: Platform.select({
      ios: "person.fill.badge.plus",
      android: "ic_menu_rotate"
    })
  },
  toggleBlockHost: {
    id: "toggle-block-host",
    title: (event) => {
      if (event.host.relations.youToThem === "blocked") {
        return `Unblock ${event.host.username}`
      } else {
        return `Block ${event.host.username}`
      }
    },
    image: (event) => {
      if (event.host.relations.youToThem !== "blocked") {
        return Platform.select({
          ios: "person.slash.fill",
          android: "ic_menu_delete"
        })
      } else {
        return Platform.select({
          ios: "person.fill.checkmark",
          android: "ic_menu_revert"
        })
      }
    }
  }
} as const satisfies Record<string, BaseEventMenuAction>

const ATTENDEE_STATUS_ACTIONS = {
  hosting: [
    EVENT_MENU_ACTION.assignHost,
    EVENT_MENU_ACTION.copyEvent,
    EVENT_MENU_ACTION.inviteFriends,
    EVENT_MENU_ACTION.shareEvent
  ],
  attending: [
    EVENT_MENU_ACTION.reportEvent,
    EVENT_MENU_ACTION.toggleBlockHost,
    EVENT_MENU_ACTION.copyEvent,
    EVENT_MENU_ACTION.contactHost,
    EVENT_MENU_ACTION.inviteFriends,
    EVENT_MENU_ACTION.shareEvent
  ],
  "not-participating": [
    EVENT_MENU_ACTION.reportEvent,
    EVENT_MENU_ACTION.toggleBlockHost,
    EVENT_MENU_ACTION.copyEvent,
    EVENT_MENU_ACTION.contactHost,
    EVENT_MENU_ACTION.shareEvent
  ]
} as Readonly<Record<string, EventMenuAction[]>>
