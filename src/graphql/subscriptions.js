/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onIncrementLikes = /* GraphQL */ `
  subscription OnIncrementLikes {
    onIncrementLikes {
      createdAt
      updatedAt
      userId
      description
      parentId
      channel
      receiver
      isParent
      likes
      replies
    }
  }
`;
export const onDecrementLikes = /* GraphQL */ `
  subscription OnDecrementLikes {
    onDecrementLikes {
      createdAt
      updatedAt
      userId
      description
      parentId
      channel
      receiver
      isParent
      likes
      replies
    }
  }
`;
export const onMyNewFriendships = /* GraphQL */ `
  subscription OnMyNewFriendships {
    onMyNewFriendships {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
export const onAllDeletedFriendships = /* GraphQL */ `
  subscription OnAllDeletedFriendships {
    onAllDeletedFriendships {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
export const onNewFriendRequest = /* GraphQL */ `
  subscription OnNewFriendRequest($receiver: ID!) {
    onNewFriendRequest(receiver: $receiver) {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
export const onNewMessage = /* GraphQL */ `
  subscription OnNewMessage($users: [ID!]!) {
    onNewMessage(users: $users) {
      createdAt
      updatedAt
      id
      users
      lastUser
      lastMessage
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
export const onCreateConversation = /* GraphQL */ `
  subscription OnCreateConversation($users: String) {
    onCreateConversation(users: $users) {
      createdAt
      updatedAt
      id
      users
      lastUser
      lastMessage
    }
  }
`;
export const onUpdateConversation = /* GraphQL */ `
  subscription OnUpdateConversation($users: String) {
    onUpdateConversation(users: $users) {
      createdAt
      updatedAt
      id
      users
      lastUser
      lastMessage
    }
  }
`;
export const onDeleteConversation = /* GraphQL */ `
  subscription OnDeleteConversation($users: String) {
    onDeleteConversation(users: $users) {
      createdAt
      updatedAt
      id
      users
      lastUser
      lastMessage
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
export const onCreatePost = /* GraphQL */ `
  subscription OnCreatePost {
    onCreatePost {
      createdAt
      updatedAt
      userId
      description
      parentId
      channel
      receiver
      isParent
      likes
      replies
    }
  }
`;
export const onUpdatePost = /* GraphQL */ `
  subscription OnUpdatePost {
    onUpdatePost {
      createdAt
      updatedAt
      userId
      description
      parentId
      channel
      receiver
      isParent
      likes
      replies
    }
  }
`;
export const onDeletePost = /* GraphQL */ `
  subscription OnDeletePost {
    onDeletePost {
      createdAt
      updatedAt
      userId
      description
      parentId
      channel
      receiver
      isParent
      likes
      replies
    }
  }
`;
export const onCreateReadReceipt = /* GraphQL */ `
  subscription OnCreateReadReceipt($userId: String) {
    onCreateReadReceipt(userId: $userId) {
      createdAt
      updatedAt
      userId
      conversationId
    }
  }
`;
export const onUpdateReadReceipt = /* GraphQL */ `
  subscription OnUpdateReadReceipt($userId: String) {
    onUpdateReadReceipt(userId: $userId) {
      createdAt
      updatedAt
      userId
      conversationId
    }
  }
`;
export const onDeleteReadReceipt = /* GraphQL */ `
  subscription OnDeleteReadReceipt($userId: String) {
    onDeleteReadReceipt(userId: $userId) {
      createdAt
      updatedAt
      userId
      conversationId
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
