import { unimplemented } from "../helpers/unimplemented"
import { UserPosts } from "@lib/posts/UserPosts"

/**
 * A `UserPosts` instance which causes a test failure when invoking
 * any of its functions.
 */
export const unimplementedUserPosts: UserPosts = {
  postsWithIds: () => unimplemented("postsWithIds")
} as const
