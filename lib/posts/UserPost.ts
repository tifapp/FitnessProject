import { Post } from "src/models"
import { postIdFromComponents } from "./PostIDComponents"

/**
 * A type representing a post that comes from a user, which is meant for
 * viewing in a feed.
 */
export type UserPost = {
  readonly id: string;
  readonly likesCount: number;
  readonly repliesCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly userId: string;
  readonly username: string;
  readonly description?: string;
  readonly parentId?: string;
  readonly channel?: string;
  readonly imageURL?: string;
  readonly likedByYou: boolean;
  readonly writtenByYou: boolean;
  readonly taggedUserIds: string[];
};

/**
 * A simple way to convert a `UserPost` to a legacy `Post` type.
 */
export const userPostToPost = (userPost: UserPost): Post => ({
  id: userPost.id,
  userId: userPost.userId,
  likes: userPost.likesCount,
  replies: userPost.repliesCount,
  createdAt: userPost.createdAt.toString(),
  updatedAt: userPost.updatedAt.toString(),
  description: userPost.description,
  parentId: userPost.parentId,
  channel: userPost.channel,
  imageURL: userPost.imageURL
})

/**
 * Some `UserPost` objects for testing and UI previewing purposes.
 */
export namespace TestUserPosts {
  const defaultTestPostDate = new Date("2023-01-31T00:00:00+0000")

  export const writtenByYou: UserPost = {
    id: postIdFromComponents({
      creationDate: defaultTestPostDate,
      userId: "you"
    }),
    likesCount: 0,
    repliesCount: 0,
    createdAt: defaultTestPostDate,
    updatedAt: defaultTestPostDate,
    userId: "you",
    username: "You",
    description: "I wrote this amazing post!",
    likedByYou: false,
    writtenByYou: true,
    taggedUserIds: []
  }

  export const blob: UserPost = {
    id: postIdFromComponents({
      creationDate: defaultTestPostDate,
      userId: "blob"
    }),
    likesCount: 0,
    repliesCount: 0,
    createdAt: defaultTestPostDate,
    updatedAt: defaultTestPostDate,
    userId: "blob",
    username: "Blob",
    description: "I am Blob",
    likedByYou: false,
    writtenByYou: false,
    taggedUserIds: []
  }
}
