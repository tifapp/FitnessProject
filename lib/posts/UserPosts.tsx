import { UserPostID } from "./UserPost";
import { UserPostMap } from "./UserPostMap";
import { createContext, ReactNode, useContext } from "react";

/**
 * An interface representing all the collection of all of the posts in the app.
 */
export interface UserPosts {
  postsWithIds: (ids: UserPostID[]) => Promise<UserPostMap>;
}

// TODO: - We should probably have a generic dependencies system for this...

const PostsContext = createContext<UserPosts | null>(null);

/**
 * Returns an instance of `UserPosts` provided by `UserPostsProvider`.
 */
export const useUserPostsDependency = () => useContext(PostsContext)!!; // NB: Programmer error if not used under a UserPostsProvider

export type UserPostsProviderProps = {
  posts: UserPosts;
  children: ReactNode;
};

/**
 * Provides a `UserPosts` instance to child components.
 */
export const UserPostsProvider = ({
  posts,
  children,
}: UserPostsProviderProps) => (
  <PostsContext.Provider value={posts}>{children}</PostsContext.Provider>
);
