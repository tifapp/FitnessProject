import { CurrentUserEvent, EventMocks } from "./events"
import { uuid } from "./uuid"

export type UserFriendStatus =
  | "not-friends"
  | "friend-request-pending"
  | "friends"
  | "blocked"

export type User = {
  id: string
  username: string
  handle: string
  biography: string
  profileImageURL: string
  events: CurrentUserEvent[]
  userStatus: UserFriendStatus | "current-user"
}

/**
 * Some mock {@link User} objects.
 */
export namespace UserMocks {
  export const Mia = {
    id: uuid(),
    username: "Mia Anderson",
    handle: "@MysticalMia",
    biography:
      "The placemark info should then be geocoded from the coordinates if it is not available." +
      "The placemark info should then be geocoded from the coordinates if it is not available." +
      "The placemark info should then be geocoded from the coordinates if it is not available." +
      "The placemark info should then be geocoded from the coordinates if it is not available." +
      "The placemark info should then be geocoded from the coordinates if it is not available.",
    profileImageURL: "",
    events: [
      EventMocks.NoPlacemarkInfo,
      EventMocks.Multiday,
      EventMocks.PickupBasketball
    ],
    userStatus: "not-friends"
  } as User
}
