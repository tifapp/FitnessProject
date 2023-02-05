import { Tagged } from "../Tagged";
import { Post } from "src/models";
import { UserID } from "../users/types";

export type UserPostIDComponents = {
  creationDate: Date;
  userId: UserID;
};

export class UserPostID extends Tagged<UserPost, string> {
  /**
   * Attempts to create a `UserPostID` from a raw string.
   */
  static fromRawValue(rawValue: string): UserPostID | undefined {
    const splits = rawValue.split("#");
    if (splits.length !== 2) return undefined;

    const [dateString, userId] = splits;
    const date = Date.parse(dateString);
    if (isNaN(date)) return undefined;

    return new UserPostID({
      creationDate: new Date(date),
      userId: new UserID(userId),
    });
  }

  // NB: Atm we don't have an actual post id field, however existing code
  // simply uses the post creation date and user id. Hopefully, this constructor
  // can be removed at some point in favor of making this type a simple Tagged
  // derivative like UserID.
  constructor({ creationDate, userId }: UserPostIDComponents) {
    super(`${creationDate.toISOString()}#${userId.rawValue}`);
  }

  components(): UserPostIDComponents {
    const splits = this.rawValue.split("#");
    return {
      creationDate: new Date(splits[0]),
      userId: new UserID(splits[1]),
    };
  }
}

export class UserPostChannel extends Tagged<UserPost, string> {}

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
  readonly channel?: UserPostChannel;
  readonly imageURL?: string;
  readonly likedByYou: boolean;
  readonly writtenByYou: boolean;
  readonly taggedUserIds: UserID[];
};

/**
 * A simple way to convert a `UserPost` to a legacy `Post` type.
 */
export const userPostToPost = (userPost: UserPost): Post => ({
  id: userPost.id.rawValue,
  userId: userPost.userId.rawValue,
  likes: userPost.likesCount,
  replies: userPost.repliesCount,
  createdAt: userPost.createdAt.toString(),
  updatedAt: userPost.updatedAt.toString(),
  description: userPost.description,
  parentId: userPost.parentId?.rawValue,
  channel: userPost.channel?.rawValue,
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
