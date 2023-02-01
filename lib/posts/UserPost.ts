import { Post } from "src/models";
import { UserID } from "../users/types";

export type UserPost = {
  likesCount: number;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: UserID;
  username: string;
  description?: string;
  channel?: string;
  imageURL?: string;
  likedByYou: boolean;
  writtenByYou: boolean;
};

export const userPostToPost = (userPost: UserPost): Post => ({
  id: userPost.createdAt.toString() + userPost.userId.rawValue,
  userId: userPost.userId.rawValue,
  likes: userPost.likesCount,
  replies: userPost.repliesCount,
  createdAt: userPost.createdAt.toString(),
  updatedAt: userPost.updatedAt.toString(),
  description: userPost.description,
  channel: userPost.channel,
  imageURL: userPost.imageURL,
});

export namespace TestUserPosts {
  export const writtenByYou: UserPost = {
    likesCount: 0,
    repliesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: new UserID("you"),
    username: "You",
    description: "I wrote this amazing post!",
    likedByYou: false,
    writtenByYou: true,
  } as const;

  export const blob: UserPost = {
    likesCount: 0,
    repliesCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: new UserID("blob"),
    username: "Blob",
    description: "I am Blob",
    likedByYou: false,
    writtenByYou: false,
  } as const;
}
