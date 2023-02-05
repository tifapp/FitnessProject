import { UserPost, UserPostID } from "./UserPost";

/**
 * A mapping of `UserPostID` instances to `UserPost` instances.
 */
export class UserPostMap {
  private map: Map<string, UserPost>;

  constructor(postMappings?: [UserPostID, UserPost][]) {
    this.map = new Map<string, UserPost>(
      postMappings?.map(([id, post]) => [id.rawValue, post])
    );
  }

  /**
   * Returns the `UserPost` with the given id or undefined if it doesn't exist.
   */
  get(id: UserPostID): UserPost | undefined {
    return this.map.get(id.rawValue);
  }

  /**
   * Returns the number of entries in this map.
   */
  get size(): number {
    return this.map.size;
  }
}

/**
 * Groups an array of `UserPost` instances by their id into a `UserPostMap`.
 */
export const groupUserPosts = (posts: UserPost[]): UserPostMap => {
  return new UserPostMap(posts.map((post) => [post.id, post]));
};
