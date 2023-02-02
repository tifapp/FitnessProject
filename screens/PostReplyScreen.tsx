import { UserPostID } from "../lib/posts/UserPost";
import { ActivityIndicator } from "react-native";

export type PostReplyScreenProps = {
  postId: UserPostID;
  replyId: UserPostID;
};

const PostReplyScreen = ({ postId, replyId }: PostReplyScreenProps) => (
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

export default PostReplyScreen;
