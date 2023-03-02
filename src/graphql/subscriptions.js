/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateLikeForPost = /* GraphQL */ `
  subscription OnCreateLikeForPost($postId: ID!) {
    onCreateLikeForPost(postId: $postId) {
      createdAt
      updatedAt
      userId
      postId
    }
  }
`;
export const onDeleteLikeForPost = /* GraphQL */ `
  subscription OnDeleteLikeForPost($postId: ID!) {
    onDeleteLikeForPost(postId: $postId) {
      createdAt
      updatedAt
      userId
      postId
    }
  }
`;
export const onCreatePostFromChannel = /* GraphQL */ `
  subscription OnCreatePostFromChannel($channel: ID!) {
    onCreatePostFromChannel(channel: $channel) {
      likes
      replies
      createdAt
      updatedAt
      userId
      postOwner
      description
      channel
      receiver
      parentId
      imageURL
      taggedUsers
    }
  }
`;
export const onCreatePostForReceiver = /* GraphQL */ `
  subscription OnCreatePostForReceiver($receiver: ID!) {
    onCreatePostForReceiver(receiver: $receiver) {
      likes
      replies
      createdAt
      updatedAt
      userId
      postOwner
      description
      channel
      receiver
      parentId
      imageURL
      taggedUsers
    }
  }
`;
export const onCreatePostByUser = /* GraphQL */ `
  subscription OnCreatePostByUser($userId: ID!) {
    onCreatePostByUser(userId: $userId) {
      likes
      replies
      createdAt
      updatedAt
      userId
      postOwner
      description
      channel
      receiver
      parentId
      imageURL
      taggedUsers
    }
  }
`;
export const onUpdatePostFromChannel = /* GraphQL */ `
  subscription OnUpdatePostFromChannel($channel: ID!) {
    onUpdatePostFromChannel(channel: $channel) {
      likes
      replies
      createdAt
      updatedAt
      userId
      postOwner
      description
      channel
      receiver
      parentId
      imageURL
      taggedUsers
    }
  }
`;
export const onDeletePostFromChannel = /* GraphQL */ `
  subscription OnDeletePostFromChannel($channel: ID!) {
    onDeletePostFromChannel(channel: $channel) {
      likes
      replies
      createdAt
      updatedAt
      userId
      postOwner
      description
      channel
      receiver
      parentId
      imageURL
      taggedUsers
    }
  }
`;
export const onIncrementLikes = /* GraphQL */ `
  subscription OnIncrementLikes($createdAt: AWSDateTime!, $userId: ID!) {
    onIncrementLikes(createdAt: $createdAt, userId: $userId) {
      likes
      replies
      createdAt
      updatedAt
      userId
      postOwner
      description
      channel
      receiver
      parentId
      imageURL
      taggedUsers
    }
  }
`;
export const onDecrementLikes = /* GraphQL */ `
  subscription OnDecrementLikes($createdAt: AWSDateTime!, $userId: ID!) {
    onDecrementLikes(createdAt: $createdAt, userId: $userId) {
      likes
      replies
      createdAt
      updatedAt
      userId
      postOwner
      description
      channel
      receiver
      parentId
      imageURL
      taggedUsers
    }
  }
`;
export const onIncrementReplies = /* GraphQL */ `
  subscription OnIncrementReplies($createdAt: AWSDateTime!, $userId: ID!) {
    onIncrementReplies(createdAt: $createdAt, userId: $userId) {
      likes
      replies
      createdAt
      updatedAt
      userId
      postOwner
      description
      channel
      receiver
      parentId
      imageURL
      taggedUsers
    }
  }
`;
export const onDecrementReplies = /* GraphQL */ `
  subscription OnDecrementReplies($createdAt: AWSDateTime!, $userId: ID!) {
    onDecrementReplies(createdAt: $createdAt, userId: $userId) {
      likes
      replies
      createdAt
      updatedAt
      userId
      postOwner
      description
      channel
      receiver
      parentId
      imageURL
      taggedUsers
    }
  }
`;
export const onAcceptedFriendship = /* GraphQL */ `
  subscription OnAcceptedFriendship {
    onAcceptedFriendship {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
export const onCreateFriendRequestForReceiver = /* GraphQL */ `
  subscription OnCreateFriendRequestForReceiver($receiver: ID!) {
    onCreateFriendRequestForReceiver(receiver: $receiver) {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
export const onDeleteConversation = /* GraphQL */ `
  subscription OnDeleteConversation($users: [ID!]!) {
    onDeleteConversation(users: $users) {
      createdAt
      updatedAt
      id
      users
      lastUser
      lastMessage
      dummy
      Accepted
    }
  }
`;
export const onDeleteFriendship = /* GraphQL */ `
  subscription OnDeleteFriendship {
    onDeleteFriendship {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
export const onCreateBlock = /* GraphQL */ `
  subscription OnCreateBlock(
    $filter: ModelSubscriptionBlockFilterInput
    $userId: String
  ) {
    onCreateBlock(filter: $filter, userId: $userId) {
      createdAt
      userId
      blockee
      updatedAt
    }
  }
`;
export const onUpdateBlock = /* GraphQL */ `
  subscription OnUpdateBlock(
    $filter: ModelSubscriptionBlockFilterInput
    $userId: String
  ) {
    onUpdateBlock(filter: $filter, userId: $userId) {
      createdAt
      userId
      blockee
      updatedAt
    }
  }
`;
export const onDeleteBlock = /* GraphQL */ `
  subscription OnDeleteBlock(
    $filter: ModelSubscriptionBlockFilterInput
    $userId: String
  ) {
    onDeleteBlock(filter: $filter, userId: $userId) {
      createdAt
      userId
      blockee
      updatedAt
    }
  }
`;
export const onCreateChallenge = /* GraphQL */ `
  subscription OnCreateChallenge(
    $filter: ModelSubscriptionChallengeFilterInput
  ) {
    onCreateChallenge(filter: $filter) {
      id
      name
      Description
      endDate
      winner
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateChallenge = /* GraphQL */ `
  subscription OnUpdateChallenge(
    $filter: ModelSubscriptionChallengeFilterInput
  ) {
    onUpdateChallenge(filter: $filter) {
      id
      name
      Description
      endDate
      winner
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteChallenge = /* GraphQL */ `
  subscription OnDeleteChallenge(
    $filter: ModelSubscriptionChallengeFilterInput
  ) {
    onDeleteChallenge(filter: $filter) {
      id
      name
      Description
      endDate
      winner
      createdAt
      updatedAt
    }
  }
`;
export const onCreateGroup = /* GraphQL */ `
  subscription OnCreateGroup($filter: ModelSubscriptionGroupFilterInput) {
    onCreateGroup(filter: $filter) {
      id
      userID
      name
      Privacy
      Sport
      Description
      characterCount
      latitude
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateGroup = /* GraphQL */ `
  subscription OnUpdateGroup($filter: ModelSubscriptionGroupFilterInput) {
    onUpdateGroup(filter: $filter) {
      id
      userID
      name
      Privacy
      Sport
      Description
      characterCount
      latitude
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteGroup = /* GraphQL */ `
  subscription OnDeleteGroup($filter: ModelSubscriptionGroupFilterInput) {
    onDeleteGroup(filter: $filter) {
      id
      userID
      name
      Privacy
      Sport
      Description
      characterCount
      latitude
      createdAt
      updatedAt
    }
  }
`;
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser(
    $filter: ModelSubscriptionUserFilterInput
    $id: String
  ) {
    onCreateUser(filter: $filter, id: $id) {
      id
      identityId
      name
      age
      gender
      bio
      goals
      location {
        latitude
        longitude
      }
      status
      deviceToken
      friendRequestPrivacy
      messagesPrivacy
      isVerified
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser(
    $filter: ModelSubscriptionUserFilterInput
    $id: String
  ) {
    onUpdateUser(filter: $filter, id: $id) {
      id
      identityId
      name
      age
      gender
      bio
      goals
      location {
        latitude
        longitude
      }
      status
      deviceToken
      friendRequestPrivacy
      messagesPrivacy
      isVerified
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser(
    $filter: ModelSubscriptionUserFilterInput
    $id: String
  ) {
    onDeleteUser(filter: $filter, id: $id) {
      id
      identityId
      name
      age
      gender
      bio
      goals
      location {
        latitude
        longitude
      }
      status
      deviceToken
      friendRequestPrivacy
      messagesPrivacy
      isVerified
      createdAt
      updatedAt
    }
  }
`;
export const onCreateVerification = /* GraphQL */ `
  subscription OnCreateVerification(
    $filter: ModelSubscriptionVerificationFilterInput
    $id: String
  ) {
    onCreateVerification(filter: $filter, id: $id) {
      id
      title
      isVerified
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateVerification = /* GraphQL */ `
  subscription OnUpdateVerification(
    $filter: ModelSubscriptionVerificationFilterInput
    $id: String
  ) {
    onUpdateVerification(filter: $filter, id: $id) {
      id
      title
      isVerified
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteVerification = /* GraphQL */ `
  subscription OnDeleteVerification(
    $filter: ModelSubscriptionVerificationFilterInput
    $id: String
  ) {
    onDeleteVerification(filter: $filter, id: $id) {
      id
      title
      isVerified
      createdAt
      updatedAt
    }
  }
`;
