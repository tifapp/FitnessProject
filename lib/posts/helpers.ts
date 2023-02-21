import { UserPost } from "./UserPost"

/**
 * Groups an array of `UserPost` instances by their id into a `UserPostMap`.
 */
export const groupUserPosts = (posts: UserPost[]): Map<string, UserPost> => {
  return new Map(posts.map((post) => [post.id, post]))
}
