import { z } from "zod"

export type UserID = string

export const NotFriendsStatusSchema = z.literal("not-friends")
export const FriendRequestPendingStatusSchema = z.literal(
  "friend-request-pending"
)
export const FriendsStatusSchema = z.literal("friends")
export const BlockedStatusSchema = z.literal("blocked")
export const CurrentUserStatusSchema = z.literal("current-user")

export const UserToProfileRelationStatusSchema = z.union([
  NotFriendsStatusSchema,
  FriendRequestPendingStatusSchema,
  FriendsStatusSchema,
  BlockedStatusSchema,
  CurrentUserStatusSchema
])

/**
 * A relationship for a user to a specified profile.
 *
 * The statuses are very much like other social platforms. You can send friend requests
 * to users, and they can choose to accept thus becoming `"friends"`.
 *
 * Users can also block each other, which functions almost exactly like other social platforms.
 *
 * `"not-friends'"` is used as the default status when no other status applies.
 */
export type UserToProfileRelationStatus = z.infer<
  typeof UserToProfileRelationStatusSchema
>

export const BlockedBidirectionalUserRelationsSchema = z.union([
  z.object({
    themToYou: BlockedStatusSchema,
    youToThem: BlockedStatusSchema
  }),

  z.object({
    themToYou: BlockedStatusSchema,
    youToThem: NotFriendsStatusSchema
  })
])

/**
 * A 2-way relationship from a user to another profile where at least one party
 * involved is blocking the other.
 */
export type BlockedBidirectionalUserRelations = z.infer<
  typeof BlockedBidirectionalUserRelationsSchema
>

export const UnblockedBidirectionalUserRelationsSchema = z.union([
  z.object({
    themToYou: NotFriendsStatusSchema,
    youToThem: NotFriendsStatusSchema
  }),
  z.object({
    themToYou: FriendRequestPendingStatusSchema,
    youToThem: NotFriendsStatusSchema
  }),
  z.object({
    themToYou: NotFriendsStatusSchema,
    youToThem: BlockedStatusSchema
  }),
  z.object({
    themToYou: NotFriendsStatusSchema,
    youToThem: FriendRequestPendingStatusSchema
  }),
  z.object({
    themToYou: FriendsStatusSchema,
    youToThem: FriendsStatusSchema
  }),
  z.object({
    themToYou: CurrentUserStatusSchema,
    youToThem: CurrentUserStatusSchema
  })
])

/**
 * A 2-way relationship from a user to another profile where no party is blocking the other.
 */
export type UnblockedBidirectionalUserRelations = z.infer<
  typeof UnblockedBidirectionalUserRelationsSchema
>

/**
 * Whether or not the given {@link UnblockedBidirectionalUserRelations}
 * represents the current user.
 */
export const isCurrentUserRelations = (
  relations: UnblockedBidirectionalUserRelations
): relations is { themToYou: "current-user"; youToThem: "current-user" } => {
  return relations.themToYou === "current-user"
}

/**
 * Returns the user relations after the current user either blocks or unblocks
 * the related user.
 */
export const toggleBlockUserRelations = (isBlocking: boolean) => {
  return {
    youToThem: isBlocking ? "blocked" : "not-friends",
    // NB: Either the block removes the friendship status, or if they
    // are unblocking then the only possible value is not friends.
    themToYou: "not-friends"
  } as const
}
