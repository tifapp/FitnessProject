import { Tagged } from "../Tagged";
import { Post } from "src/models";
import { UserID } from "../users/types";

export class UserPostID extends Tagged<UserPostID, string> {
  // NB: Atm we don't have an actual post id field, however existing code
  // simply uses the post creation date and user id. Hopefully, this constructor
  // can be removed at some point in favor of making this type a simple Tagged
  // derivative like UserID.
  constructor({
    creationDate,
    userId,
  }: {
    creationDate: Date;
    userId: UserID;
  }) {
    super(`${creationDate.toISOString()}#${userId.rawValue}`);
  }
}

/**
 * A type representing a post that comes from a user, which is meant for
 * viewing in a feed.
 */
export type UserPost = {
  readonly id: UserPostID;
  readonly likesCount: number;
  readonly repliesCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly userId: UserID;
  readonly username: string;
  readonly description?: string;
  readonly parentId?: UserPostID;
  readonly channel?: string;
  readonly imageURL?: string;
  readonly likedByYou: boolean;
  readonly writtenByYou: boolean;
  readonly taggedUserIds: UserID[];
};

/**
 * A simple way to convert a `UserPost` to a legacy `Post` type.
 */
export const userPostToPost = (userPost: UserPost): Post => ({
  id: userPost.createdAt.toString() + userPost.userId.rawValue,
  userId: userPost.userId.rawValue,
  likes: userPost.likesCount,
  replies: userPost.repliesCount,
  createdAt: userPost.createdAt.toString(),
  updatedAt: userPost.updatedAt.toString(),
  description: userPost.description,
  parentId: userPost.parentId?.rawValue,
  channel: userPost.channel,
  imageURL: userPost.imageURL,
});

/**
 * Some `UserPost` objects for testing and UI previewing purposes.
 */
export namespace TestUserPosts {
  const defaultTestPostDate = new Date("2023-01-31T00:00:00+0000");

  export const writtenByYou: UserPost = {
    id: new UserPostID({
      creationDate: defaultTestPostDate,
      userId: new UserID("you"),
    }),
    likesCount: 0,
    repliesCount: 0,
    createdAt: defaultTestPostDate,
    updatedAt: defaultTestPostDate,
    userId: new UserID("you"),
    username: "You",
    description: "I wrote this amazing post!",
    likedByYou: false,
    writtenByYou: true,
    taggedUserIds: [],
  };

  export const blob: UserPost = {
    id: new UserPostID({
      creationDate: defaultTestPostDate,
      userId: new UserID("blob"),
    }),
    likesCount: 0,
    repliesCount: 0,
    createdAt: defaultTestPostDate,
    updatedAt: defaultTestPostDate,
    userId: new UserID("blob"),
    username: "Blob",
    description: "I am Blob",
    likedByYou: false,
    writtenByYou: false,
    taggedUserIds: [],
  };
}
