import { UserPost, UserPostID } from "./UserPost";

export class UserPostMap extends Map<UserPostID, UserPost> {}

export const groupUserPosts = (posts: UserPost[]): UserPostMap => {
  return new UserPostMap();
};
