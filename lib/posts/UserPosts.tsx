import { UserPost } from "./UserPost";
import { groupUserPosts } from "./helpers";
import { createContext, ReactNode, useContext } from "react";
import { GraphQLOperations } from "../GraphQLOperations";
import { loadCapitals } from "@hooks/stringConversion";
import { batchGetLikes, getPost, getUser } from "@graphql/queries";
import { Like } from "src/models";
import { componentsFromPostId, postIdFromComponents } from "./PostIDComponents";

/**
 * An interface representing all the collection of all of the posts in the app.
 */
export interface UserPosts {
  postsWithIds: (ids: string[]) => Promise<Map<string, UserPost>>;
}

/**
 * An implementation of `UserPosts` backed by graphql.
 *
 * @param userId the current logged in user id
 * @param operations the `GraphQLOperations` instance to use
 */
export const graphQLUserPosts = (
  userId: string,
  operations: GraphQLOperations
): UserPosts => {
  // NB: Ideally we shouldn't have this, see comment below
  const fetchUsername = async (userId: string): Promise<string> => {
    const cachedUsername = globalThis.savedUsers?.[userId]?.name;
    if (cachedUsername) return cachedUsername;

    const user = await operations.execute<{
      getUser: {
        name: string;
        status: string;
        isVerified: boolean;
      };
    }>(getUser, { id: userId });
    const { name, status, isVerified } = user.getUser;

    const retName = loadCapitals(name) ?? "Deleted User";
    globalThis.savedUsers[userId] = {
      name: retName,
      status,
      isVerified: isVerified ?? false,
    };
    return retName;
  };

  return {
    // NB: At some point we want to consolidate this into 1 query that returns
    // all of the data in batch. Due to this, some of the more fragile implementation
    // details (eg. caching the user) are not directly covered in unit tests.
    // At the very least for now, as much of this loading is paralellized.
    postsWithIds: async (ids: string[]) => {
      if (ids.length === 0) return new Map();

      const rawPosts = await Promise.all<any>(
        ids
          .map((id) => componentsFromPostId(id))
          .map(async (idComponents) => {
            // NB: We force unwrap here because atm all post ids are made up of components.
            // By the time we change this fact, we'll likely also have made this entire
            // function doable with a single query entirely, meaning the implementation of
            // this function will have changed entirely.
            const { creationDate, userId } = idComponents!!;
            return await operations
              .execute(getPost, {
                createdAt: creationDate.toISOString(),
                userId: userId,
              })
              .then((value: any) => value.getPost);
          })
      );

      const userPostIds = rawPosts.map((post) => {
        return postIdFromComponents({
          creationDate: new Date(post.createdAt),
          userId: post.userId,
        });
      });

      const usernamesPromise = Promise.all<string>(
        rawPosts.map(async (post) => await fetchUsername(post.userId))
      );

      const likesPromise = operations
        .execute<{ batchGetLikes: Like[] }>(batchGetLikes, {
          likes: userPostIds.map((id) => ({ postId: id })),
        })
        .then((value) => value.batchGetLikes);

      const [usernames, likes] = await Promise.all([
        usernamesPromise,
        likesPromise,
      ]);
      return groupUserPosts(
        rawPosts.map((post, idx) => ({
          id: userPostIds[idx],
          likesCount: post.likes ?? 0,
          repliesCount: post.replies ?? 0,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          userId: post.userId,
          username: usernames[idx],
          description: post.description,
          parentId: post.parentId,
          channel: post.channel,
          imageURL: post.imageURL,
          likedByYou: likes[idx] !== null,
          writtenByYou: post.userId === userId,
          taggedUserIds: post.taggedUsers ?? [],
        }))
      );
    },
  };
};

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
