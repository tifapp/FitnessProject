import { uuidString } from "../UUID"

/**
 * A type representing the relationship status between 2 users.
 */
export type UserToProfileRelationStatus =
  | "not-friends"
  | "friend-request-pending"
  | "friends"
  | "blocked"

export type UserFriendStatus =
  | "not-friends"
  | "friend-request-pending"
  | "friends"
  | "blocked"

export type User = {
  id: string
  name: string
  handle: string
  bio: string
  profileImageURL: string
  relationStatus: UserFriendStatus | "current-user"
}

/**
 * Some mock {@link User} objects.
 */
export namespace UserMocks {
  export const Mia = {
    id: uuidString(),
    name: "Mia Anderson",
    handle: "@MysticalMia",
    bio: "When I'm not on the field or court, you can find me cheering for my favorite teams and athletes from the sidelines.",
    profileImageURL: "",
    relationStatus: "not-friends"
  } as User
}
