import { z } from "zod"

export const NotFriendsStatusSchema = z.literal("not-friends")
export const FriendRequestPendingStatusSchema = z.literal(
  "friend-request-pending"
)
export const FriendsStatusSchema = z.literal("friends")
export const BlockedStatusSchema = z.literal("blocked")

export const UserToProfileRelationStatusSchema = z.union([
  NotFriendsStatusSchema,
  FriendRequestPendingStatusSchema,
  FriendsStatusSchema,
  BlockedStatusSchema
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

export const BidirectionalUserRelationsSchema = z.union([
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
    youToThem: FriendRequestPendingStatusSchema
  }),
  z.object({
    themToYou: FriendsStatusSchema,
    youToThem: FriendsStatusSchema
  }),
  z.object({
    themToYou: BlockedStatusSchema,
    youToThem: BlockedStatusSchema
  }),
  z.object({
    themToYou: NotFriendsStatusSchema,
    youToThem: BlockedStatusSchema
  }),
  z.object({
    themToYou: BlockedStatusSchema,
    youToThem: NotFriendsStatusSchema
  })
])

/**
 * The relation status from the user to a given profile, and the status from that profile to
 * the current user.
 *
 * All possible valid relationships are represented by this union type, but perhaps the most
 * notable one to be aware about is that user's can mutually block each other.
 */
export type BidirectionalUserRelations = z.infer<
  typeof BidirectionalUserRelationsSchema
>
