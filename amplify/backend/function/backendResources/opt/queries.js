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
      Accepted
    }
  }
`;
exports.getConversationByUsers = /* GraphQL */ `
  query GetConversationByUsers($users: [ID!]!) {
    getConversationByUsers(users: $users) {
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
exports.getChallenge = /* GraphQL */ `
  query GetChallenge($id: ID!) {
    getChallenge(id: $id) {
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
exports.listChallenges = /* GraphQL */ `
  query ListChallenges(
    $filter: ModelChallengeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listChallenges(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        Description
        open
        winner
        createdAt
        updatedAt
      }
      nextToken
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
      Accepted
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
        Accepted
      }
      nextToken
    }
  }
`;
exports.conversationsByAcceptedAndDate = /* GraphQL */ `
  query ConversationsByAcceptedAndDate(
    $dummy: Int
    $acceptedUpdatedAt: ModelConversationByAcceptedAndDateCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    conversationsByAcceptedAndDate(
      dummy: $dummy
      acceptedUpdatedAt: $acceptedUpdatedAt
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
        Accepted
      }
      nextToken
    }
  }
`;
exports.conversationsByDateAndAccepted = /* GraphQL */ `
  query ConversationsByDateAndAccepted(
    $dummy: Int
    $updatedAtAccepted: ModelConversationByDateAndAcceptedCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    conversationsByDateAndAccepted(
      dummy: $dummy
      updatedAtAccepted: $updatedAtAccepted
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
        Accepted
      }
      nextToken
    }
  }
`;
exports.conversationsByAcceptedThenDate = /* GraphQL */ `
  query ConversationsByAcceptedThenDate(
    $Accepted: Int
    $updatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    conversationsByAcceptedThenDate(
      Accepted: $Accepted
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
        Accepted
      }
      nextToken
    }
  }
`;
exports.conversationsByAccepted = /* GraphQL */ `
  query ConversationsByAccepted(
    $dummy: Int
    $Accepted: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    conversationsByAccepted(
      dummy: $dummy
      Accepted: $Accepted
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
        Accepted
      }
      nextToken
    }
  }
`;
exports.conversationsByDate = /* GraphQL */ `
  query ConversationsByDate(
    $dummy: Int
    $updatedAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    conversationsByDate(
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
        Accepted
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
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelLikeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    likesByPost(
      postId: $postId
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
        imageURL
        taggedUsers
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
        imageURL
        taggedUsers
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
        imageURL
        taggedUsers
        likes
        replies
      }
      nextToken
    }
  }
`;
exports.postsByLikes = /* GraphQL */ `
  query PostsByLikes(
    $channel: ID
    $likes: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByLikes(
      channel: $channel
      likes: $likes
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
        imageURL
        taggedUsers
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
      imageURL
      taggedUsers
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
        imageURL
        taggedUsers
        likes
        replies
      }
      nextToken
    }
  }
`;
exports.getReport = /* GraphQL */ `
  query GetReport($createdAt: AWSDateTime!, $postId: ID!) {
    getReport(createdAt: $createdAt, postId: $postId) {
      createdAt
      updatedAt
      userId
      postId
      message
    }
  }
`;
exports.listReports = /* GraphQL */ `
  query ListReports(
    $createdAt: AWSDateTime
    $postId: ModelIDKeyConditionInput
    $filter: ModelReportFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listReports(
      createdAt: $createdAt
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
        message
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
      nextToken
    }
  }
`;
exports.getVerification = /* GraphQL */ `
  query GetVerification($id: ID!) {
    getVerification(id: $id) {
      id
      title
      isVerified
      createdAt
      updatedAt
    }
  }
`;
exports.listVerifications = /* GraphQL */ `
  query ListVerifications(
    $filter: ModelVerificationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listVerifications(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        isVerified
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
