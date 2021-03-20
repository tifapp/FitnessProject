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
export const batchGetFriendRequests = /* GraphQL */ `
  query BatchGetFriendRequests($friendrequests: [CreateFriendRequestInput]) {
    batchGetFriendRequests(friendrequests: $friendrequests) {
      createdAt
      updatedAt
      sender
      receiver
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
export const searchGroups = /* GraphQL */ `
  query SearchGroups(
    $filter: SearchableGroupFilterInput
    $sort: SearchableGroupSortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchGroups(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
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
      total
    }
  }
`;
export const getFriendRequest = /* GraphQL */ `
  query GetFriendRequest($sender: ID!, $receiver: ID!) {
    getFriendRequest(sender: $sender, receiver: $receiver) {
      createdAt
      updatedAt
      sender
      receiver
    }
  }
`;
export const listFriendRequests = /* GraphQL */ `
  query ListFriendRequests(
    $sender: ID
    $receiver: ModelIDKeyConditionInput
    $filter: ModelFriendRequestFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFriendRequests(
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
      }
      nextToken
    }
  }
`;
export const friendRequestsByReceiver = /* GraphQL */ `
  query FriendRequestsByReceiver(
    $receiver: ID
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFriendRequestFilterInput
    $limit: Int
    $nextToken: String
  ) {
    friendRequestsByReceiver(
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
      }
      nextToken
    }
  }
`;
export const getFriendship = /* GraphQL */ `
  query GetFriendship($user1: ID!, $user2: ID!) {
    getFriendship(user1: $user1, user2: $user2) {
      createdAt
      updatedAt
      user1
      user2
      hifives
    }
  }
`;
export const listFriendships = /* GraphQL */ `
  query ListFriendships(
    $user1: ID
    $user2: ModelIDKeyConditionInput
    $filter: ModelFriendshipFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFriendships(
      user1: $user1
      user2: $user2
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        createdAt
        updatedAt
        user1
        user2
        hifives
      }
      nextToken
    }
  }
`;
export const friendsBySecondUser = /* GraphQL */ `
  query FriendsBySecondUser(
    $user2: ID
    $user1: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFriendshipFilterInput
    $limit: Int
    $nextToken: String
  ) {
    friendsBySecondUser(
      user2: $user2
      user1: $user1
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        createdAt
        updatedAt
        user1
        user2
        hifives
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
export const postsByChannel = /* GraphQL */ `
  query PostsByChannel(
    $channel: ID
    $parentIdIsParentCreatedAt: ModelPostByChannelCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByChannel(
      channel: $channel
      parentIdIsParentCreatedAt: $parentIdIsParentCreatedAt
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
        parentId
        channel
        receiver
        isParent
        likes
      }
      nextToken
    }
  }
`;
export const postsByParentId = /* GraphQL */ `
  query PostsByParentId(
    $parentId: String
    $isParent: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByParentId(
      parentId: $parentId
      isParent: $isParent
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
        parentId
        channel
        receiver
        isParent
        likes
      }
      nextToken
    }
  }
`;
export const getPost = /* GraphQL */ `
  query GetPost($createdAt: AWSDateTime!, $userId: ID!) {
    getPost(createdAt: $createdAt, userId: $userId) {
      createdAt
      updatedAt
      userId
      description
      parentId
      channel
      receiver
      isParent
      likes
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
        createdAt
        updatedAt
        userId
        description
        parentId
        channel
        receiver
        isParent
        likes
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
      latitude
      longitude
      deviceToken
      createdAt
      updatedAt
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
export const searchUsers = /* GraphQL */ `
  query SearchUsers(
    $filter: SearchableUserFilterInput
    $sort: SearchableUserSortInput
    $limit: Int
    $nextToken: String
    $from: Int
  ) {
    searchUsers(
      filter: $filter
      sort: $sort
      limit: $limit
      nextToken: $nextToken
      from: $from
    ) {
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
      total
    }
  }
`;
