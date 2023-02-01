import { Tagged } from "../Tagged";
import { Post } from "src/models";
import { UserID } from "../users/types";

export class UserPostID extends Tagged<UserPostID, string> {
  // NB: Atm we don't have an actual post id field, so the work around for
  // now is to use this constructor.
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

export type UserPost = {
  id: UserPostID;
  likesCount: number;
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: UserID;
  username: string;
  description?: string;
  parentId?: UserPostID;
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
  parentId: userPost.parentId?.rawValue,
  channel: userPost.channel,
  imageURL: userPost.imageURL,
});

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
  } as const;

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
  } as const;
}
