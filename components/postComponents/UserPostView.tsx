import PostItem from "@components/PostItem";
import { UserPost, userPostToPost } from "../../lib/posts";

export type UserPostViewProps = {
  post: UserPost;
  onDeleted: () => void;
};

// TODO: - This is just a temp placeholder component, this will need to be
// refactored at some point in compliance with the new project structure.
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
