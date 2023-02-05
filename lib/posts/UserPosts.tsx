import { UserPost, UserPostChannel, UserPostID } from "./UserPost";
import { groupUserPosts, UserPostMap } from "./UserPostMap";
import { createContext, ReactNode, useContext } from "react";
import { UserID } from "../users";
import { GraphQLOperations } from "../GraphQLOperations";
import { loadCapitals } from "@hooks/stringConversion";
import { batchGetLikes, getPost, getUser } from "@graphql/queries";
import { Like, Post } from "src/models";

/**
 * An interface representing all the collection of all of the posts in the app.
 */
export interface UserPosts {
  postsWithIds: (ids: UserPostID[]) => Promise<UserPostMap>;
}

/**
 * An implementation of `UserPosts` backed by graphql.
 *
 * @param userId the current logged in user id
 * @param operations the `GraphQLOperations` instance to use
 */
export const graphQLUserPosts = (
  userId: UserID,
  operations: GraphQLOperations
): UserPosts => {
  // NB: Ideally we shouldn't have this, see comment below
  const fetchUsername = async (userId: UserID): Promise<string> => {
    const cachedUsername = globalThis.savedUsers?.[userId.rawValue]?.name;
    if (cachedUsername) return cachedUsername;

    const user = await operations.execute<{
      getUser: {
        name: string;
        status: string;
        isVerified: boolean;
      };
    }>(getUser, { id: userId.rawValue });
    const { name, status, isVerified } = user.getUser;

    const retName = loadCapitals(name) ?? "Deleted User";
    globalThis.savedUsers[userId.rawValue] = {
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
    postsWithIds: async (ids: UserPostID[]) => {
      if (ids.length === 0) return new UserPostMap();

      const rawPosts = await Promise.all<any>(
        ids
          .map((id) => id.legacyComponents())
          .map(async (idComponents) => {
            // NB: We force unwrap here because atm all post ids are made up of components.
            // By the time we change this fact, we'll likely also have made this entire
            // function doable with a single query entirely, meaning the implementation of
            // this function will have changed entirely.
            const { creationDate, userId } = idComponents!!;
            return await operations
              .execute(getPost, {
                createdAt: creationDate.toISOString(),
                userId: userId.rawValue,
              })
              .then((value: any) => value.getPost);
          })
      );

      const userPostIds = rawPosts.map((post) => {
        return UserPostID.fromLegacyComponents({
          creationDate: new Date(post.createdAt),
          userId: new UserID(post.userId),
        });
      });

      const usernamesPromise = Promise.all<string>(
        rawPosts.map(
          async (post) => await fetchUsername(new UserID(post.userId))
        )
      );

      const likesPromise = operations
        .execute<{ batchGetLikes: Like[] }>(batchGetLikes, {
          likes: userPostIds.map((id) => ({ postId: id.rawValue })),
        })
        .then((value) => value.batchGetLikes);

      const [usernames, likes] = await Promise.all([
        usernamesPromise,
        likesPromise,
      ]);
      return groupUserPosts(
        rawPosts.map<UserPost>((post, idx) => ({
          id: userPostIds[idx],
          likesCount: post.likes ?? 0,
          repliesCount: post.replies ?? 0,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
          userId: new UserID(post.userId),
          username: usernames[idx],
          description: post.description,
          parentId: post.parentId ? new UserPostID(post.parentId) : undefined,
          channel: post.channel ? new UserPostChannel(post.channel) : undefined,
          imageURL: post.imageURL,
          likedByYou: likes[idx] !== null,
          writtenByYou: post.userId === userId.rawValue,
          taggedUserIds:
            post.taggedUsers?.map((id: string) => new UserID(id)) ?? [],
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
