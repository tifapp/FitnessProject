/* eslint-disable */
// this is an auto generated file. This will be overwritten

exports.batchGetLikes = /* GraphQL */ `
  query BatchGetLikes($likes: [CreateLikeInput]) {
    batchGetLikes(likes: $likes) {
      createdAt
      updatedAt
      userId
      postId
    }
  }
`;
exports.batchGetConversations = /* GraphQL */ `
  query BatchGetConversations($ids: [DeleteConversationInput]) {
    batchGetConversations(ids: $ids) {
      createdAt
      updatedAt
      id
      users
      lastUser
      lastMessage
      dummy
    }
  }
`;
exports.getGroup = /* GraphQL */ `
  query GetGroup($id: ID!) {
    getGroup(id: $id) {
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
exports.listGroups = /* GraphQL */ `
  query ListGroups(
    $filter: ModelGroupFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGroups(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
exports.getBlock = /* GraphQL */ `
  query GetBlock($userId: ID!, $blockee: ID!) {
    getBlock(userId: $userId, blockee: $blockee) {
      createdAt
      userId
      blockee
      updatedAt
    }
  }
`;
exports.listBlocks = /* GraphQL */ `
  query ListBlocks(
    $userId: ID
    $blockee: ModelIDKeyConditionInput
    $filter: ModelBlockFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listBlocks(
      userId: $userId
      blockee: $blockee
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        createdAt
        userId
        blockee
        updatedAt
      }
      nextToken
    }
  }
`;
exports.blocksByDate = /* GraphQL */ `
  query BlocksByDate(
    $userId: ID
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelBlockFilterInput
    $limit: Int
    $nextToken: String
  ) {
    blocksByDate(
      userId: $userId
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        createdAt
        userId
        blockee
        updatedAt
      }
      nextToken
    }
  }
`;
exports.getConversation = /* GraphQL */ `
  query GetConversation($id: ID!) {
    getConversation(id: $id) {
      createdAt
      updatedAt
      id
      users
      lastUser
      lastMessage
      dummy
    }
  }
`;
exports.listConversations = /* GraphQL */ `
  query ListConversations(
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listConversations(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        createdAt
        updatedAt
        id
        users
        lastUser
        lastMessage
        dummy
      }
      nextToken
    }
  }
`;
exports.conversationsByLastUpdated = /* GraphQL */ `
  query ConversationsByLastUpdated(
    $dummy: Int
    $updatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    conversationsByLastUpdated(
      dummy: $dummy
      updatedAt: $updatedAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        createdAt
        updatedAt
        id
        users
        lastUser
        lastMessage
        dummy
      }
      nextToken
    }
  }
`;
exports.getFriendship = /* GraphQL */ `
  query GetFriendship($sender: ID!, $receiver: ID!) {
    getFriendship(sender: $sender, receiver: $receiver) {
      createdAt
      updatedAt
      sender
      receiver
      accepted
    }
  }
`;
exports.listFriendships = /* GraphQL */ `
  query ListFriendships(
    $sender: ID
    $receiver: ModelIDKeyConditionInput
    $filter: ModelFriendshipFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFriendships(
      sender: $sender
      receiver: $receiver
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        createdAt
        updatedAt
        sender
        receiver
        accepted
      }
      nextToken
    }
  }
`;
exports.friendsByReceiver = /* GraphQL */ `
  query FriendsByReceiver(
    $receiver: ID
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFriendshipFilterInput
    $limit: Int
    $nextToken: String
  ) {
    friendsByReceiver(
      receiver: $receiver
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        createdAt
        updatedAt
        sender
        receiver
        accepted
      }
      nextToken
    }
  }
`;
exports.getLike = /* GraphQL */ `
  query GetLike($userId: ID!, $postId: ID!) {
    getLike(userId: $userId, postId: $postId) {
      createdAt
      updatedAt
      userId
      postId
    }
  }
`;
exports.listLikes = /* GraphQL */ `
  query ListLikes(
    $userId: ID
    $postId: ModelIDKeyConditionInput
    $filter: ModelLikeFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listLikes(
      userId: $userId
      postId: $postId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        createdAt
        updatedAt
        userId
        postId
      }
      nextToken
    }
  }
`;
exports.likesByPost = /* GraphQL */ `
  query LikesByPost(
    $postId: ID
    $userId: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelLikeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    likesByPost(
      postId: $postId
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        createdAt
        updatedAt
        userId
        postId
      }
      nextToken
    }
  }
`;
exports.postsByUser = /* GraphQL */ `
  query PostsByUser(
    $userId: ID
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByUser(
      userId: $userId
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;
exports.postsByReceiver = /* GraphQL */ `
  query PostsByReceiver(
    $receiver: ID
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByReceiver(
      receiver: $receiver
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;
exports.postsByChannel = /* GraphQL */ `
  query PostsByChannel(
    $channel: ID
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByChannel(
      channel: $channel
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;
exports.getPost = /* GraphQL */ `
  query GetPost($createdAt: AWSDateTime!, $userId: ID!) {
    getPost(createdAt: $createdAt, userId: $userId) {
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
exports.listPosts = /* GraphQL */ `
  query ListPosts(
    $createdAt: AWSDateTime
    $userId: ModelIDKeyConditionInput
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listPosts(
      createdAt: $createdAt
      userId: $userId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
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
      nextToken
    }
  }
`;
exports.getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
exports.listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
