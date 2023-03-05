/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const batchGetLikes = /* GraphQL */ `
  query BatchGetLikes($likes: [CreateLikeInput]) {
    batchGetLikes(likes: $likes) {
      createdAt
      updatedAt
      userId
      postId
    }
  }
`;
export const batchGetConversations = /* GraphQL */ `
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
export const getConversationByUsers = /* GraphQL */ `
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
export const getBlock = /* GraphQL */ `
  query GetBlock($userId: ID!, $blockee: ID!) {
    getBlock(userId: $userId, blockee: $blockee) {
      createdAt
      userId
      blockee
      updatedAt
    }
  }
`;
export const listBlocks = /* GraphQL */ `
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
export const blocksByDate = /* GraphQL */ `
  query BlocksByDate(
    $userId: ID!
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
export const getChallenge = /* GraphQL */ `
  query GetChallenge($id: ID!) {
    getChallenge(id: $id) {
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
export const listChallenges = /* GraphQL */ `
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
        endDate
        winner
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getConversation = /* GraphQL */ `
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
export const listConversations = /* GraphQL */ `
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
export const conversationsByAcceptedAndDate = /* GraphQL */ `
  query ConversationsByAcceptedAndDate(
    $dummy: Int!
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
export const conversationsByDateAndAccepted = /* GraphQL */ `
  query ConversationsByDateAndAccepted(
    $dummy: Int!
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
export const conversationsByAccepted = /* GraphQL */ `
  query ConversationsByAccepted(
    $dummy: Int!
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
export const conversationsByDate = /* GraphQL */ `
  query ConversationsByDate(
    $dummy: Int!
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
export const conversationsByAcceptedThenDate = /* GraphQL */ `
  query ConversationsByAcceptedThenDate(
    $Accepted: Int!
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
export const getEvent = /* GraphQL */ `
  query GetEvent($createdAt: AWSDateTime!, $userId: ID!) {
    getEvent(createdAt: $createdAt, userId: $userId) {
      comments
      createdAt
      updatedAt
      userId
      eventOwner
      description
      host
      parentId
      radius
      startDateTime
      endDateTime
      name
      location {
        latitude
        longitude
      }
      users {
        items {
          id
          identityId
          name
          age
          gender
          bio
          goals
          status
          deviceToken
          friendRequestPrivacy
          messagesPrivacy
          isVerified
          createdAt
          updatedAt
          eventUsersId
          eventUsersUserId
        }
        nextToken
      }
    }
  }
`;
export const listEvents = /* GraphQL */ `
  query ListEvents(
    $createdAt: AWSDateTime
    $userId: ModelIDKeyConditionInput
    $filter: ModelEventFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listEvents(
      createdAt: $createdAt
      userId: $userId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        comments
        createdAt
        updatedAt
        userId
        eventOwner
        description
        host
        parentId
        radius
        startDateTime
        endDateTime
        name
        location {
          latitude
          longitude
        }
        users {
          nextToken
        }
      }
      nextToken
    }
  }
`;
export const eventsByUser = /* GraphQL */ `
  query EventsByUser(
    $userId: ID!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelEventFilterInput
    $limit: Int
    $nextToken: String
  ) {
    eventsByUser(
      userId: $userId
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        comments
        createdAt
        updatedAt
        userId
        eventOwner
        description
        host
        parentId
        radius
        startDateTime
        endDateTime
        name
        location {
          latitude
          longitude
        }
        users {
          nextToken
        }
      }
      nextToken
    }
  }
`;
export const eventsByUserId = /* GraphQL */ `
  query EventsByUserId(
    $host: String!
    $userId: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelEventFilterInput
    $limit: Int
    $nextToken: String
  ) {
    eventsByUserId(
      host: $host
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        comments
        createdAt
        updatedAt
        userId
        eventOwner
        description
        host
        parentId
        radius
        startDateTime
        endDateTime
        name
        location {
          latitude
          longitude
        }
        users {
          nextToken
        }
      }
      nextToken
    }
  }
`;
export const eventsByDate = /* GraphQL */ `
  query EventsByDate(
    $startDateTime: AWSDateTime!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelEventFilterInput
    $limit: Int
    $nextToken: String
  ) {
    eventsByDate(
      startDateTime: $startDateTime
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        comments
        createdAt
        updatedAt
        userId
        eventOwner
        description
        host
        parentId
        radius
        startDateTime
        endDateTime
        name
        location {
          latitude
          longitude
        }
        users {
          nextToken
        }
      }
      nextToken
    }
  }
`;
export const searchEvents = /* GraphQL */ `
  query SearchEvents(
    $filter: SearchableEventFilterInput
    $sort: [SearchableEventSortInput]
    $limit: Int
    $nextToken: String
    $from: Int
    $aggregates: [SearchableEventAggregationInput]
  ) {
    searchEvents(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
      aggregates: $aggregates
    ) {
      items {
        comments
        createdAt
        updatedAt
        userId
        eventOwner
        description
        host
        parentId
        radius
        startDateTime
        endDateTime
        name
        location {
          latitude
          longitude
        }
        users {
          nextToken
        }
      }
      nextToken
      total
      aggregateItems {
        name
        result {
          ... on SearchableAggregateScalarResult {
            value
          }
          ... on SearchableAggregateBucketResult {
            buckets {
              key
              doc_count
            }
          }
        }
      }
    }
  }
`;
export const getFriendship = /* GraphQL */ `
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
export const listFriendships = /* GraphQL */ `
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
export const friendsByReceiver = /* GraphQL */ `
  query FriendsByReceiver(
    $receiver: ID!
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
export const getGroup = /* GraphQL */ `
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
export const listGroups = /* GraphQL */ `
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
export const getLike = /* GraphQL */ `
  query GetLike($userId: ID!, $postId: ID!) {
    getLike(userId: $userId, postId: $postId) {
      createdAt
      updatedAt
      userId
      postId
    }
  }
`;
export const listLikes = /* GraphQL */ `
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
export const likesByPost = /* GraphQL */ `
  query LikesByPost(
    $postId: ID!
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
export const getPost = /* GraphQL */ `
  query GetPost($createdAt: AWSDateTime!, $userId: ID!) {
    getPost(createdAt: $createdAt, userId: $userId) {
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
export const listPosts = /* GraphQL */ `
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
      nextToken
    }
  }
`;
export const postsByUser = /* GraphQL */ `
  query PostsByUser(
    $userId: ID!
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
      nextToken
    }
  }
`;
export const postsByChannel = /* GraphQL */ `
  query PostsByChannel(
    $channel: ID!
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
      nextToken
    }
  }
`;
export const postsByLikes = /* GraphQL */ `
  query PostsByLikes(
    $channel: ID!
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
      nextToken
    }
  }
`;
export const postsByUserId = /* GraphQL */ `
  query PostsByUserId(
    $channel: ID!
    $userId: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByUserId(
      channel: $channel
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;
export const getReport = /* GraphQL */ `
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
export const listReports = /* GraphQL */ `
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
export const getUser = /* GraphQL */ `
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
      isVerified
      event {
        comments
        createdAt
        updatedAt
        userId
        eventOwner
        description
        host
        parentId
        radius
        startDateTime
        endDateTime
        name
        location {
          latitude
          longitude
        }
        users {
          nextToken
        }
      }
      createdAt
      updatedAt
      eventUsersId
      eventUsersUserId
    }
  }
`;
export const listUsers = /* GraphQL */ `
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
        isVerified
        event {
          comments
          createdAt
          updatedAt
          userId
          eventOwner
          description
          host
          parentId
          radius
          startDateTime
          endDateTime
          name
        }
        createdAt
        updatedAt
        eventUsersId
        eventUsersUserId
      }
      nextToken
    }
  }
`;
export const getVerification = /* GraphQL */ `
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
export const listVerifications = /* GraphQL */ `
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
