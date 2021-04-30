/* eslint-disable */
// this is an auto generated file. This will be overwritten

exports.batchDeletePosts = /* GraphQL */ `
  mutation BatchDeletePosts($posts: [DeletePostInput]) {
    batchDeletePosts(posts: $posts) {
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
exports.incrementLikes = /* GraphQL */ `
  mutation IncrementLikes($input: incrementLikesInput!) {
    incrementLikes(input: $input) {
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
exports.decrementLikes = /* GraphQL */ `
  mutation DecrementLikes($input: incrementLikesInput!) {
    decrementLikes(input: $input) {
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
exports.createGroup = /* GraphQL */ `
  mutation CreateGroup(
    $input: CreateGroupInput!
    $condition: ModelGroupConditionInput
  ) {
    createGroup(input: $input, condition: $condition) {
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
exports.updateGroup = /* GraphQL */ `
  mutation UpdateGroup(
    $input: UpdateGroupInput!
    $condition: ModelGroupConditionInput
  ) {
    updateGroup(input: $input, condition: $condition) {
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
exports.deleteGroup = /* GraphQL */ `
  mutation DeleteGroup(
    $input: DeleteGroupInput!
    $condition: ModelGroupConditionInput
  ) {
    deleteGroup(input: $input, condition: $condition) {
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
exports.updateLike = /* GraphQL */ `
  mutation UpdateLike(
    $input: UpdateLikeInput!
    $condition: ModelLikeConditionInput
  ) {
    updateLike(input: $input, condition: $condition) {
      createdAt
      updatedAt
      userId
      postId
    }
  }
`;
exports.deleteReadReceipt = /* GraphQL */ `
  mutation DeleteReadReceipt(
    $input: DeleteReadReceiptInput!
    $condition: ModelReadReceiptConditionInput
  ) {
    deleteReadReceipt(input: $input, condition: $condition) {
      createdAt
      updatedAt
      userId
      conversationId
    }
  }
`;
exports.createBlock = /* GraphQL */ `
  mutation CreateBlock(
    $input: CreateBlockInput!
    $condition: ModelBlockConditionInput
  ) {
    createBlock(input: $input, condition: $condition) {
      createdAt
      userId
      blockee
      updatedAt
    }
  }
`;
exports.updateBlock = /* GraphQL */ `
  mutation UpdateBlock(
    $input: UpdateBlockInput!
    $condition: ModelBlockConditionInput
  ) {
    updateBlock(input: $input, condition: $condition) {
      createdAt
      userId
      blockee
      updatedAt
    }
  }
`;
exports.deleteBlock = /* GraphQL */ `
  mutation DeleteBlock(
    $input: DeleteBlockInput!
    $condition: ModelBlockConditionInput
  ) {
    deleteBlock(input: $input, condition: $condition) {
      createdAt
      userId
      blockee
      updatedAt
    }
  }
`;
exports.createConversation = /* GraphQL */ `
  mutation CreateConversation(
    $input: CreateConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    createConversation(input: $input, condition: $condition) {
      createdAt
      updatedAt
      id
      users
      lastUser
      lastMessage
    }
  }
`;
exports.updateConversation = /* GraphQL */ `
  mutation UpdateConversation(
    $input: UpdateConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    updateConversation(input: $input, condition: $condition) {
      createdAt
      updatedAt
      id
      users
      lastUser
      lastMessage
    }
  }
`;
exports.deleteConversation = /* GraphQL */ `
  mutation DeleteConversation(
    $input: DeleteConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    deleteConversation(input: $input, condition: $condition) {
      createdAt
      updatedAt
      id
      users
      lastUser
      lastMessage
    }
  }
`;
exports.createFriendship = /* GraphQL */ `
  mutation CreateFriendship(
    $input: CreateFriendshipInput!
    $condition: ModelFriendshipConditionInput
  ) {
    createFriendship(input: $input, condition: $condition) {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
exports.updateFriendship = /* GraphQL */ `
  mutation UpdateFriendship(
    $input: UpdateFriendshipInput!
    $condition: ModelFriendshipConditionInput
  ) {
    updateFriendship(input: $input, condition: $condition) {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
exports.deleteFriendship = /* GraphQL */ `
  mutation DeleteFriendship(
    $input: DeleteFriendshipInput!
    $condition: ModelFriendshipConditionInput
  ) {
    deleteFriendship(input: $input, condition: $condition) {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
exports.createLike = /* GraphQL */ `
  mutation CreateLike(
    $input: CreateLikeInput!
    $condition: ModelLikeConditionInput
  ) {
    createLike(input: $input, condition: $condition) {
      createdAt
      updatedAt
      userId
      postId
    }
  }
`;
exports.deleteLike = /* GraphQL */ `
  mutation DeleteLike(
    $input: DeleteLikeInput!
    $condition: ModelLikeConditionInput
  ) {
    deleteLike(input: $input, condition: $condition) {
      createdAt
      updatedAt
      userId
      postId
    }
  }
`;
exports.createPost = /* GraphQL */ `
  mutation CreatePost(
    $input: CreatePostInput!
    $condition: ModelPostConditionInput
  ) {
    createPost(input: $input, condition: $condition) {
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
exports.updatePost = /* GraphQL */ `
  mutation UpdatePost(
    $input: UpdatePostInput!
    $condition: ModelPostConditionInput
  ) {
    updatePost(input: $input, condition: $condition) {
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
exports.deletePost = /* GraphQL */ `
  mutation DeletePost(
    $input: DeletePostInput!
    $condition: ModelPostConditionInput
  ) {
    deletePost(input: $input, condition: $condition) {
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
exports.createReadReceipt = /* GraphQL */ `
  mutation CreateReadReceipt(
    $input: CreateReadReceiptInput!
    $condition: ModelReadReceiptConditionInput
  ) {
    createReadReceipt(input: $input, condition: $condition) {
      createdAt
      updatedAt
      userId
      conversationId
    }
  }
`;
exports.updateReadReceipt = /* GraphQL */ `
  mutation UpdateReadReceipt(
    $input: UpdateReadReceiptInput!
    $condition: ModelReadReceiptConditionInput
  ) {
    updateReadReceipt(input: $input, condition: $condition) {
      createdAt
      updatedAt
      userId
      conversationId
    }
  }
`;
exports.createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
exports.updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
exports.deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
