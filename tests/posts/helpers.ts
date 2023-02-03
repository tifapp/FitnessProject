import { unimplemented } from "../helpers/unimplemented";
import { Posts } from "../../lib/posts/Posts";

/**
 * A `Posts` instance which causes a test failure when invoking
 * any of its functions.
 */
export const unimplementedPosts: Posts = {
  postsWithIds: () => unimplemented("postsWithIds"),
} as const;
