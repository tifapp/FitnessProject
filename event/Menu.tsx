import { Ionicon } from "@components/common/Icons"
import { ClientSideEvent } from "@event/ClientSideEvent"
import { updateEventDetailsQueryEvent } from "@event/DetailsQuery"
import { useFontScale } from "@lib/Fonts"
import { MenuAction, MenuView } from "@react-native-menu/menu"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useIsSignedIn } from "@user/Session"
import {
  Platform,
  Share,
  ShareContent,
  StyleProp,
  ViewStyle
} from "react-native"
import {
  UnblockedUserRelationsStatus,
  UserID
} from "TiFShared/domain-models/User"

export type EventMenuActionsListKey = keyof typeof EVENT_MENU_ACTIONS_LISTS

export type UseEventActionsMenuEnvironment = {
  blockHost: (id: UserID) => Promise<void>
  unblockHost: (id: UserID) => Promise<void>
}

type ToggleBlockMutationArgs = {
  hostId: UserID
  isBlocking: boolean
  originalRelations: UnblockedUserRelationsStatus
}

/**
 * A hook that controls the state of the menu actions.
 */
export const useEventActionsMenu = (
  event: Pick<ClientSideEvent, "id" | "userAttendeeStatus" | "host">,
  env: UseEventActionsMenuEnvironment
) => {
  const queryClient = useQueryClient()
  const toggleBlockMutation = useMutation(
    async ({ isBlocking, hostId }: ToggleBlockMutationArgs) => {
      if (isBlocking) {
        await env.blockHost(hostId)
      } else {
        await env.unblockHost(hostId)
      }
    },
    {
      onError: (_, { originalRelations }) => {
        updateEventDetailsQueryEvent(queryClient, event.id, (e) => ({
          ...e,
          host: { ...e.host, relationStatus: originalRelations }
        }))
      }
    }
  )
  return {
    actionsListKey: useIsSignedIn()
      ? (event.userAttendeeStatus as EventMenuActionsListKey)
      : ("not-signed-in" as EventMenuActionsListKey),
    isToggleBlockHostError: toggleBlockMutation.isError,
    blockHostToggled: () => {
      const isBlocking = event.host.relationStatus !== "blocked-them"
      updateEventDetailsQueryEvent(queryClient, event.id, (e) => ({
        ...e,
        host: {
          ...e.host,
          relationStatus: isBlocking ? "blocked-them" : ("not-friends" as const)
        }
      }))
      toggleBlockMutation.mutate({
        isBlocking,
        hostId: event.host.id,
        originalRelations: event.host.relationStatus
      })
    }
  }
}

export type EventActionsMenuProps = {
  event: ClientSideEvent
  state: ReturnType<typeof useEventActionsMenu>
  eventShareContent: () => Promise<ShareContent>
  onCopyEventTapped: () => void
  onEditEventTapped: () => void
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
export const EventActionsMenuView = ({
  event,
  state,
  eventShareContent,
  onCopyEventTapped,
  onEditEventTapped,
  style
}: EventActionsMenuProps) => (
  <MenuView
    // TODO: - Error UI
    onPressAction={({ nativeEvent }) => {
      const callbacks = {
        "copy-event": onCopyEventTapped,
        "toggle-block-host": state.blockHostToggled,
        "edit-event": onEditEventTapped,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "share-event": async () => {
          Share.share(await eventShareContent())
        }
      } as const
      callbacks[nativeEvent.event as keyof typeof callbacks]()
    }}
    actions={formatEventMenuActions(
      event,
      EVENT_MENU_ACTIONS_LISTS[state.actionsListKey]
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
  event: ClientSideEvent,
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
  title: string | ((event: ClientSideEvent) => string)
  image: string | undefined | ((event: ClientSideEvent) => string | undefined)
}

export const EVENT_MENU_ACTION = {
  editEvent: {
    id: "edit-event",
    title: "Edit Event",
    image: Platform.select({
      ios: "pencil.line",
      android: "ic_menu_edit"
    })
  },
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
    title: (event) => `Contact ${event.host.name}`,
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
      if (event.host.relationStatus === "blocked-them") {
        return `Unblock ${event.host.name}`
      } else {
        return `Block ${event.host.name}`
      }
    },
    image: (event) => {
      if (event.host.relationStatus !== "blocked-them") {
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

const EVENT_MENU_ACTIONS_LISTS = {
  hosting: [
    EVENT_MENU_ACTION.copyEvent,
    EVENT_MENU_ACTION.editEvent,
    EVENT_MENU_ACTION.shareEvent
  ],
  attending: [
    EVENT_MENU_ACTION.toggleBlockHost,
    EVENT_MENU_ACTION.copyEvent,
    EVENT_MENU_ACTION.shareEvent
  ],
  "not-participating": [
    EVENT_MENU_ACTION.toggleBlockHost,
    EVENT_MENU_ACTION.copyEvent,
    EVENT_MENU_ACTION.shareEvent
  ],
  "not-signed-in": [EVENT_MENU_ACTION.shareEvent]
} as const satisfies Readonly<Record<string, EventMenuAction[]>>
