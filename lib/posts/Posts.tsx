import { UserPostID } from "./UserPost";
import { UserPostMap } from "./UserPostMap";
import { createContext, ReactNode, useContext } from "react";

export interface Posts {
  postsWithIds: (ids: UserPostID[]) => Promise<UserPostMap>;
}

// TODO: - We should probably have a generic dependencies system for this...

const PostsContext = createContext<Posts | null>(null);

export const usePosts = () => useContext(PostsContext)!!; // NB: Programmer error if not used under a PostsProvider

export type PostsProviderProps = {
  posts: Posts;
  children: ReactNode;
};

export const PostsProvider = ({ posts, children }: PostsProviderProps) => (
  <PostsContext.Provider value={posts}>{children}</PostsContext.Provider>
);
