import PostItem from "@components/PostItem";
import { UserPost, userPostToPost } from "../../lib/posts";

export type UserPostViewProps = {
  post: UserPost;
  onDeleted: () => void;
};

// TODO: - Refactor this to be a more friendly post item
const UserPostView = ({ post, onDeleted }: UserPostViewProps) => (
  <PostItem
    item={userPostToPost(post)}
    likes={post.likesCount}
    writtenByYou={post.writtenByYou}
    reportPost={async () => 1}
    operations={{
      removeItem: onDeleted,
      replaceItem: () => {},
    }}
  />
);

export default UserPostView;
