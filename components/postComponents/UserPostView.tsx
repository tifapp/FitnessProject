import PostItem from "@components/PostItem";
import { UserPost, userPostToPost } from "../../lib/posts";

export type UserPostViewProps = {
  post: UserPost;
};

const UserPostView = ({ post }: UserPostViewProps) => (
  <PostItem
    item={userPostToPost(post)}
    likes={post.likesCount}
    writtenByYou={post.writtenByYou}
    reportPost={async () => 1}
    operations={{
      removeItem: () => {},
      replaceItem: () => {},
    }}
  />
);

export default UserPostView;
