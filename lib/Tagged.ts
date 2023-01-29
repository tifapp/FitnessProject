/**
 * "Tags" a particular raw value type to a particular "Tag" type.
 *
 * This is mostly useful when expressing the notion of ids. For example,
 * consider a function to like a post based on it's id. Maybe the id is
 * a random string generated from Amplify, we may first write code like this:
 *
 * ```ts
 * const likePost = async (postId: string) => {
 *  // Code to like a post...
 * }
 * ```
 *
 * The problem with this code is that any string can be passed in for the `postId`
 * paramteter. For instance:
 *
 * ```ts
 * await likePost("Hello") // Hello is definitely not a valid post id
 * ```
 *
 * A better way to aproach this would be to ensure that the id passed into the function is
 * actually the id of a post, with `Tagged` it looks like this:
 *
 * ```ts
 * type PostID = Tagged<Post, string>;
 *
 * interface Post {
 *  id: PostID
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
 * `likePost` can then be used as such.
 *
 * ```ts
 * const doSomethingWithPost = async (post: Post) => {
 *  // ...
 *  await likePost(post.id)
 *  // ...
 * }
 * ```
 */
export class Tagged<_Tag, RawValue> {
  rawValue: RawValue;

  constructor(rawValue: RawValue) {
    this.rawValue = rawValue;
  }
}
