import { Post } from "src/models";
import { UserID } from "../users/types";

export type UserPost = {
  likesCount: number;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: UserID;
  description: string | null;
  channel: string | null;
  receiver: UserID | null;
  imageURL: string | null;
  likedByYou: boolean;
  writtenByYou: boolean;
};

export const userPostToPost = (userPost: UserPost): Post => {
  return {
    id: userPost.createdAt.toString() + userPost.userId.rawValue,
    userId: userPost.userId.rawValue,
    likes: userPost.likesCount,
    replies: userPost.repliesCount,
    createdAt: userPost.createdAt.toString(),
    updatedAt: userPost.updatedAt.toString(),
    description: userPost.description,
    channel: userPost.channel,
    receiver: userPost.receiver?.rawValue,
    parentId: null,
    imageURL: userPost.imageURL,
  };
};
