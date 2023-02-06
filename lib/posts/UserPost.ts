import { Tagged } from "../Tagged";
import { Post } from "src/models";
import { UserID } from "../users/types";

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
 * The components that make up a legacy formatted `UserPostID`.
 *
 * Legacy format is a string of "{creationDate iso formatted}#{user id}"
 */
export type LegacyUserPostIDComponents = {
  creationDate: Date;
  userId: UserID;
};

/**
 * A type that encapsulates a post id. This type gives ways for it to be constructed from
 * a set of legacy components (whilst also giving the ability to retrieve said components)
 * that at present make up what a post id is. At some point, this will likely no longer be
 * the case, so it is possible to construct this type directly from a raw string.
 */
export class UserPostID extends Tagged<UserPost, string> {
  /**
   * Constructs a `UserPostID` in legacy format from its raw components.
   *
   * Legacy format is a string of "{creationDate iso formatted}#{user id}"
   */
  static fromLegacyComponents({
    creationDate,
    userId,
  }: LegacyUserPostIDComponents): UserPostID {
    return new UserPostID(`${creationDate.toISOString()}#${userId.rawValue}`);
  }

  /**
   * A way to retrieve the components making up a legacy formatted post id.
   *
   * Legacy format is a string of "{creationDate iso formatted}#{user id}"
   */
  legacyComponents(): LegacyUserPostIDComponents | undefined {
    const splits = this.rawValue.split("#");
    if (splits.length !== 2) return undefined;

    const [dateString, userId] = splits;
    const date = Date.parse(dateString);
    if (isNaN(date)) return undefined;

    return {
      creationDate: new Date(date),
      userId: new UserID(userId),
    };
  }
}

export class UserPostChannel extends Tagged<UserPost, string> {}

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
    id: UserPostID.fromLegacyComponents({
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
    id: UserPostID.fromLegacyComponents({
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
