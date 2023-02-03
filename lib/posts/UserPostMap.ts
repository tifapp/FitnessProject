import { UserPost, UserPostID } from "./UserPost";

/**
 * A mapping of `UserPostID` instances to `UserPost` instances.
 */
export class UserPostMap extends Map<UserPostID, UserPost> {}

/**
 * Groups an array of `UserPost` instances by their id into a `UserPostMap`.
 */
export const groupUserPosts = (posts: UserPost[]): UserPostMap => {
  return new UserPostMap(posts.map((post) => [post.id, post]));
};
