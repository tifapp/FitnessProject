/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const batchDeletePosts = /* GraphQL */ `
  mutation BatchDeletePosts($posts: [DeletePostInput]) {
    batchDeletePosts(posts: $posts) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      imageURL
      likes
      replies
    }
  }
`;
export const verifyUser = /* GraphQL */ `
  mutation VerifyUser($input: verifyUserInput!) {
    verifyUser(input: $input) {
      id
      identityId
      name
      age
      gender
      bio
      goals
      latitude
      longitude
      status
      deviceToken
      friendRequestPrivacy
      messagesPrivacy
      createdAt
      updatedAt
      isVerified
    }
  }
`;
export const incrementLikes = /* GraphQL */ `
  mutation IncrementLikes($input: incrementLikesInput!) {
    incrementLikes(input: $input) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      imageURL
      likes
      replies
    }
  }
`;
export const decrementLikes = /* GraphQL */ `
  mutation DecrementLikes($input: incrementLikesInput!) {
    decrementLikes(input: $input) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      imageURL
      likes
      replies
    }
  }
`;
export const incrementReplies = /* GraphQL */ `
  mutation IncrementReplies($input: incrementLikesInput!) {
    incrementReplies(input: $input) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      imageURL
      likes
      replies
    }
  }
`;
export const decrementReplies = /* GraphQL */ `
  mutation DecrementReplies($input: incrementLikesInput!) {
    decrementReplies(input: $input) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      imageURL
      likes
      replies
    }
  }
`;
export const createGroup = /* GraphQL */ `
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
export const updateGroup = /* GraphQL */ `
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
export const deleteGroup = /* GraphQL */ `
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
export const createBlock = /* GraphQL */ `
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
export const updateBlock = /* GraphQL */ `
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
export const deleteBlock = /* GraphQL */ `
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
export const createConversation = /* GraphQL */ `
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
      dummy
      Accepted
    }
  }
`;
export const updateConversation = /* GraphQL */ `
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
      dummy
      Accepted
    }
  }
`;
export const deleteConversation = /* GraphQL */ `
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
      dummy
      Accepted
    }
  }
`;
export const createFriendship = /* GraphQL */ `
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
export const updateFriendship = /* GraphQL */ `
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
export const deleteFriendship = /* GraphQL */ `
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
export const createLike = /* GraphQL */ `
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
export const updateLike = /* GraphQL */ `
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
export const deleteLike = /* GraphQL */ `
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
export const deletePost = /* GraphQL */ `
  mutation DeletePost(
    $input: DeletePostInput!
    $condition: ModelPostConditionInput
  ) {
    deletePost(input: $input, condition: $condition) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      imageURL
      likes
      replies
    }
  }
`;
export const createPost = /* GraphQL */ `
  mutation CreatePost(
    $input: CreatePostInput!
    $condition: ModelPostConditionInput
  ) {
    createPost(input: $input, condition: $condition) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      imageURL
      likes
      replies
    }
  }
`;
export const updatePost = /* GraphQL */ `
  mutation UpdatePost(
    $input: UpdatePostInput!
    $condition: ModelPostConditionInput
  ) {
    updatePost(input: $input, condition: $condition) {
      createdAt
      updatedAt
      userId
      description
      channel
      receiver
      parentId
      imageURL
      likes
      replies
    }
  }
`;
export const createReport = /* GraphQL */ `
  mutation CreateReport(
    $input: CreateReportInput!
    $condition: ModelReportConditionInput
  ) {
    createReport(input: $input, condition: $condition) {
      createdAt
      updatedAt
      userId
      postId
      message
    }
  }
`;
export const updateReport = /* GraphQL */ `
  mutation UpdateReport(
    $input: UpdateReportInput!
    $condition: ModelReportConditionInput
  ) {
    updateReport(input: $input, condition: $condition) {
      createdAt
      updatedAt
      userId
      postId
      message
    }
  }
`;
export const deleteReport = /* GraphQL */ `
  mutation DeleteReport(
    $input: DeleteReportInput!
    $condition: ModelReportConditionInput
  ) {
    deleteReport(input: $input, condition: $condition) {
      createdAt
      updatedAt
      userId
      postId
      message
    }
  }
`;
export const createUser = /* GraphQL */ `
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
      status
      deviceToken
      friendRequestPrivacy
      messagesPrivacy
      createdAt
      updatedAt
      isVerified
    }
  }
`;
export const updateUser = /* GraphQL */ `
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
      status
      deviceToken
      friendRequestPrivacy
      messagesPrivacy
      createdAt
      updatedAt
      isVerified
    }
  }
`;
export const deleteUser = /* GraphQL */ `
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
      status
      deviceToken
      friendRequestPrivacy
      messagesPrivacy
      createdAt
      updatedAt
      isVerified
    }
  }
`;
export const createVerification = /* GraphQL */ `
  mutation CreateVerification(
    $input: CreateVerificationInput!
    $condition: ModelVerificationConditionInput
  ) {
    createVerification(input: $input, condition: $condition) {
      id
      isVerified
      createdAt
      updatedAt
    }
  }
`;
export const updateVerification = /* GraphQL */ `
  mutation UpdateVerification(
    $input: UpdateVerificationInput!
    $condition: ModelVerificationConditionInput
  ) {
    updateVerification(input: $input, condition: $condition) {
      id
      isVerified
      createdAt
      updatedAt
    }
  }
`;
export const deleteVerification = /* GraphQL */ `
  mutation DeleteVerification(
    $input: DeleteVerificationInput!
    $condition: ModelVerificationConditionInput
  ) {
    deleteVerification(input: $input, condition: $condition) {
      id
      isVerified
      createdAt
      updatedAt
    }
  }
`;
