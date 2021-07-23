/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreatePostFromChannel = /* GraphQL */ `
  subscription OnCreatePostFromChannel($channel: ID!) {
    onCreatePostFromChannel(channel: $channel) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      likes
      replies
    }
  }
`;
export const onCreatePostForReceiver = /* GraphQL */ `
  subscription OnCreatePostForReceiver($receiver: ID!) {
    onCreatePostForReceiver(receiver: $receiver) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      likes
      replies
    }
  }
`;
export const onCreatePostByUser = /* GraphQL */ `
  subscription OnCreatePostByUser($userId: ID!) {
    onCreatePostByUser(userId: $userId) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      likes
      replies
    }
  }
`;
export const onUpdatePostFromChannel = /* GraphQL */ `
  subscription OnUpdatePostFromChannel($channel: ID!) {
    onUpdatePostFromChannel(channel: $channel) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      likes
      replies
    }
  }
`;
export const onDeletePostFromChannel = /* GraphQL */ `
  subscription OnDeletePostFromChannel($channel: ID!) {
    onDeletePostFromChannel(channel: $channel) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      likes
      replies
    }
  }
`;
export const onIncrementLikes = /* GraphQL */ `
  subscription OnIncrementLikes($createdAt: AWSDateTime!, $userId: ID!) {
    onIncrementLikes(createdAt: $createdAt, userId: $userId) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      likes
      replies
    }
  }
`;
export const onDecrementLikes = /* GraphQL */ `
  subscription OnDecrementLikes($createdAt: AWSDateTime!, $userId: ID!) {
    onDecrementLikes(createdAt: $createdAt, userId: $userId) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      likes
      replies
    }
  }
`;
export const onIncrementReplies = /* GraphQL */ `
  subscription OnIncrementReplies($createdAt: AWSDateTime!, $userId: ID!) {
    onIncrementReplies(createdAt: $createdAt, userId: $userId) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      likes
      replies
    }
  }
`;
export const onDecrementReplies = /* GraphQL */ `
  subscription OnDecrementReplies($createdAt: AWSDateTime!, $userId: ID!) {
    onDecrementReplies(createdAt: $createdAt, userId: $userId) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      likes
      replies
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
export const onCreateOrUpdateConversation = /* GraphQL */ `
  subscription OnCreateOrUpdateConversation($users: [ID!]!) {
    onCreateOrUpdateConversation(users: $users) {
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
export const onCreateGroup = /* GraphQL */ `
  subscription OnCreateGroup {
    onCreateGroup {
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
  subscription OnUpdateGroup {
    onUpdateGroup {
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
  subscription OnDeleteGroup {
    onDeleteGroup {
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
export const onCreateBlock = /* GraphQL */ `
  subscription OnCreateBlock($userId: String) {
    onCreateBlock(userId: $userId) {
      createdAt
      userId
      blockee
      updatedAt
    }
  }
`;
export const onUpdateBlock = /* GraphQL */ `
  subscription OnUpdateBlock($userId: String) {
    onUpdateBlock(userId: $userId) {
      createdAt
      userId
      blockee
      updatedAt
    }
  }
`;
export const onDeleteBlock = /* GraphQL */ `
  subscription OnDeleteBlock($userId: String) {
    onDeleteBlock(userId: $userId) {
      createdAt
      userId
      blockee
      updatedAt
    }
  }
`;
export const onCreateFriendship = /* GraphQL */ `
  subscription OnCreateFriendship($sender: String, $receiver: String) {
    onCreateFriendship(sender: $sender, receiver: $receiver) {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
export const onUpdateFriendship = /* GraphQL */ `
  subscription OnUpdateFriendship($sender: String, $receiver: String) {
    onUpdateFriendship(sender: $sender, receiver: $receiver) {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
export const onDeleteFriendship = /* GraphQL */ `
  subscription OnDeleteFriendship($sender: String, $receiver: String) {
    onDeleteFriendship(sender: $sender, receiver: $receiver) {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
export const onCreateLike = /* GraphQL */ `
  subscription OnCreateLike($userId: String) {
    onCreateLike(userId: $userId) {
      createdAt
      updatedAt
      userId
      postId
    }
  }
`;
export const onUpdateLike = /* GraphQL */ `
  subscription OnUpdateLike($userId: String) {
    onUpdateLike(userId: $userId) {
      createdAt
      updatedAt
      userId
      postId
    }
  }
`;
export const onDeleteLike = /* GraphQL */ `
  subscription OnDeleteLike($userId: String) {
    onDeleteLike(userId: $userId) {
      createdAt
      updatedAt
      userId
      postId
    }
  }
`;
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
      id
      identityId
      name
      age
      gender
      bio
      goals
      latitude
      longitude
      deviceToken
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
      id
      identityId
      name
      age
      gender
      bio
      goals
      latitude
      longitude
      deviceToken
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
      id
      identityId
      name
      age
      gender
      bio
      goals
      latitude
      longitude
      deviceToken
      createdAt
      updatedAt
    }
  }
`;
