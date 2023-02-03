import { UserPostID } from "../../lib/posts/UserPost";
import { useUserPostsDependency, UserPostMap } from "../../lib/posts";
import { ReactNode, useEffect, useState } from "react";
import { EmptyView } from "@components/common/EmptyView";

export type WithUserPostMapProps = {
  userPostIds: UserPostID[];
  errorView: (error: Error) => JSX.Element;
  loadingView?: JSX.Element;
  children: (posts: UserPostMap) => ReactNode;
};

/**
 * Loads a `UserPostMap` for a child component to consume based on the current
 * `UserPosts` instance in the current context.
 */
const WithUserPostMap = ({
  userPostIds: postIds,
  errorView = EmptyView,
  loadingView = <EmptyView />,
  children,
}: WithUserPostMapProps) => {
  const userPosts = useUserPostsDependency();
  const [error, setError] = useState<Error | null>(null);
  const [postMap, setPostMap] = useState<UserPostMap | null>(null);

  useEffect(() => {
    userPosts
      .postsWithIds(postIds)
      .then(setPostMap)
      .catch((error) => setError(error));
  }, [...postIds, userPosts]);

  if (error) {
    return errorView(error);
  }

  return !postMap ? loadingView : children(postMap);
};

export default WithUserPostMap;
