import { UserPostID } from "../lib/posts/UserPost";
import { ActivityIndicator, View } from "react-native";
import { usePosts } from "../lib/posts";
import { useEffect, useState } from "react";

export type PostReplyScreenProps = {
  postId: UserPostID;
  replyId: UserPostID;
};

const PostReplyScreen = ({ postId, replyId }: PostReplyScreenProps) => {
  const posts = usePosts();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    posts.postsWithIds([postId, replyId]).then(() => setIsLoaded(true));
  }, [postId, replyId]);

  if (isLoaded) {
    return <View />;
  }

  return (
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
};

export default PostReplyScreen;
