/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getGroup = /* GraphQL */ `
  query GetGroup($id: ID!) {
    getGroup(id: $id) {
      id
      userID
      name
      maxUsers
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
        maxUsers
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
export const getPost = /* GraphQL */ `
  query GetPost($timestamp: AWSTimestamp!, $userId: String!) {
    getPost(timestamp: $timestamp, userId: $userId) {
      timestamp
      userId
      description
      group
      createdAt
      updatedAt
    }
  }
`;
export const listPosts = /* GraphQL */ `
  query ListPosts(
    $timestamp: AWSTimestamp
    $userId: ModelStringKeyConditionInput
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listPosts(
      timestamp: $timestamp
      userId: $userId
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        timestamp
        userId
        description
        group
        createdAt
        updatedAt
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
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const postsByGroup = /* GraphQL */ `
  query PostsByGroup(
    $group: String
    $timestamp: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByGroup(
      group: $group
      timestamp: $timestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        timestamp
        userId
        description
        group
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getFriendRequest = /* GraphQL */ `
  query GetFriendRequest($sender: ID!, $receiver: ID!) {
    getFriendRequest(sender: $sender, receiver: $receiver) {
      sender
      receiver
      createdAt
      updatedAt
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
        sender
        receiver
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const friendRequestsByReceiver = /* GraphQL */ `
  query FriendRequestsByReceiver(
    $receiver: ID
    $sender: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFriendRequestFilterInput
    $limit: Int
    $nextToken: String
  ) {
    friendRequestsByReceiver(
      receiver: $receiver
      sender: $sender
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        sender
        receiver
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getFriendship = /* GraphQL */ `
  query GetFriendship($user1: ID!, $user2: ID!) {
    getFriendship(user1: $user1, user2: $user2) {
      user1
      user2
      timestamp
      hifives
      createdAt
      updatedAt
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
        user1
        user2
        timestamp
        hifives
        createdAt
        updatedAt
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
        user1
        user2
        timestamp
        hifives
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
