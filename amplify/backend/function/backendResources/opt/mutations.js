/* eslint-disable */
// this is an auto generated file. This will be overwritten

exports.batchDeletePosts = /* GraphQL */ `
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
      taggedUsers
      likes
      replies
    }
  }
`;
exports.verifyUser = /* GraphQL */ `
  mutation VerifyUser($input: verifyUserInput!) {
    verifyUser(input: $input) {
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
      createdAt
      updatedAt
      isVerified
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
      channel
      receiver
      parentId
      imageURL
      taggedUsers
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
      channel
      receiver
      parentId
      imageURL
      taggedUsers
      likes
      replies
    }
  }
`;
exports.incrementReplies = /* GraphQL */ `
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
      taggedUsers
      likes
      replies
    }
  }
`;
exports.decrementReplies = /* GraphQL */ `
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
      taggedUsers
      likes
      replies
    }
  }
`;
exports.createChallenge = /* GraphQL */ `
  mutation CreateChallenge(
    $input: CreateChallengeInput!
    $condition: ModelChallengeConditionInput
  ) {
    createChallenge(input: $input, condition: $condition) {
      id
      name
      Description
      open
      winner
      createdAt
      updatedAt
    }
  }
`;
exports.updateChallenge = /* GraphQL */ `
  mutation UpdateChallenge(
    $input: UpdateChallengeInput!
    $condition: ModelChallengeConditionInput
  ) {
    updateChallenge(input: $input, condition: $condition) {
      id
      name
      Description
      open
      winner
      createdAt
      updatedAt
    }
  }
`;
exports.deleteChallenge = /* GraphQL */ `
  mutation DeleteChallenge(
    $input: DeleteChallengeInput!
    $condition: ModelChallengeConditionInput
  ) {
    deleteChallenge(input: $input, condition: $condition) {
      id
      name
      Description
      open
      winner
      createdAt
      updatedAt
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
      dummy
      Accepted
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
      dummy
      Accepted
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
      dummy
      Accepted
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
      channel
      receiver
      parentId
      imageURL
      taggedUsers
      likes
      replies
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
      channel
      receiver
      parentId
      imageURL
      taggedUsers
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
      channel
      receiver
      parentId
      imageURL
      taggedUsers
      likes
      replies
    }
  }
`;
exports.createReport = /* GraphQL */ `
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
exports.updateReport = /* GraphQL */ `
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
exports.deleteReport = /* GraphQL */ `
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
      location {
        latitude
        longitude
      }
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
      location {
        latitude
        longitude
      }
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
      location {
        latitude
        longitude
      }
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
exports.createVerification = /* GraphQL */ `
  mutation CreateVerification(
    $input: CreateVerificationInput!
    $condition: ModelVerificationConditionInput
  ) {
    createVerification(input: $input, condition: $condition) {
      id
      title
      isVerified
      createdAt
      updatedAt
    }
  }
`;
exports.updateVerification = /* GraphQL */ `
  mutation UpdateVerification(
    $input: UpdateVerificationInput!
    $condition: ModelVerificationConditionInput
  ) {
    updateVerification(input: $input, condition: $condition) {
      id
      title
      isVerified
      createdAt
      updatedAt
    }
  }
`;
exports.deleteVerification = /* GraphQL */ `
  mutation DeleteVerification(
    $input: DeleteVerificationInput!
    $condition: ModelVerificationConditionInput
  ) {
    deleteVerification(input: $input, condition: $condition) {
      id
      title
      isVerified
      createdAt
      updatedAt
    }
  }
`;
