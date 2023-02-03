import { UserPost, UserPostID, userPostToPost } from "../../lib/posts/UserPost";
import { ActivityIndicator, View } from "react-native";
import { usePosts, UserPostMap } from "../../lib/posts";
import { ReactNode, useEffect, useState } from "react";
import UserPostView from "@components/postComponents/UserPostView";

export type PostsViewProps = {
  postIds: UserPostID[];
  renderError: (error: Error) => ReactNode;
  renderLoading?: () => ReactNode;
  children: (posts: UserPostMap) => ReactNode;
};

const DefaultPostsLoading = () => (
  <ActivityIndicator
    accessibilityLabel="Loading..."
    size="large"
    color="#000000"
    style={{
      alignSelf: "stretch",
      flex: 1,
      flexGrow: 1,
      justifyContent: "center",
    }}
  />
);

const WithPosts = ({
  postIds,
  renderError,
  renderLoading = DefaultPostsLoading,
  children,
}: PostsViewProps) => {
  const posts = usePosts();
  const [error, setError] = useState<Error | null>(null);
  const [postMap, setPostMap] = useState<UserPostMap | null>(null);

  useEffect(() => {
    posts
      .postsWithIds(postIds)
      .then(setPostMap)
      .catch((error) => setError(error));
  }, [...postIds, posts]);

  if (error) {
    return renderError(error);
  }

  return !postMap ? renderLoading() : children(postMap);
};

export default WithPosts;
