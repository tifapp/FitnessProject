/**
 * "Tags" a particular raw value type to a particular "Tag" type.
 *
 * This is mostly useful when we have common types being used as identifiers in some way
 * to access resources (emails, ids, etc.). For example, we may have a function to like
 * a `Post` using its id. At first, we may write code like this:
 *
 * ```ts
 * const likePost = async (postId: string) => {
 *  // Code to like a post...
 * }
 * ```
 *
 * The problem with this code is that any string can be passed in for the `postId`
 * paramteter. For instance we may accidentally pass a user id instead of a post id
 * to `likePost`, which wouldn't cause a post to be liked on the server:
 *
 * ```ts
 * const currentUserId = "...";
 * await likePost(currentUserId); // 🛑 Accidentally passed a user id in for a post id
 * ```
 *
 * We can do better by utilizing the type system to make it more explicit that `likePost` needs
 * a post id and not any random string. With `Tagged` we can improve this code like such:
 *
 * ```ts
 * class PostID extends Tagged<Post, string> {};
 *
 * type Post = {
 *  // ...
 * };
 *
 * const likePost = async (id: PostID) => {
 *  // code to like a post ...
 * };
 * ```
 *
 * This code tags the post id (which is a simple string) to the `Post` type itself
 * which makes it harder to pass an invalid id to the like function.
 *
 * We can then use `likePost` as such.
 *
 * ```ts
 * await likePost(new PostID("..."))
 * ```
 *
 * While this is not a foolproof solution to ensure that only a valid post id is passed to `likePost`,
 * at the very least it does make a very strong assertion that we expect a post id in `likePost`.
 */
export class Tagged<Tag, RawValue> {
  readonly rawValue: RawValue;

  constructor(rawValue: RawValue) {
    this.rawValue = rawValue;
  }

  /**
   * Maps the rawValue of this tagged instance, and returns a new tagged instance
   * with the mapped raw value as the new raw value.
   *
   * @param mapper a function to map the raw value to a new value
   */
  map<NewValue>(
    mapper: (rawValue: RawValue) => NewValue
  ): Tagged<Tag, NewValue> {
    return new Tagged(mapper(this.rawValue));
  }
}
