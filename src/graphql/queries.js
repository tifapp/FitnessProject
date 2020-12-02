/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getFriend = /* GraphQL */ `
  query GetFriend($sender: ID!, $receiver: ID!) {
    getFriend(sender: $sender, receiver: $receiver) {
      timestamp
      sender
      receiver
      accepted
      createdAt
      updatedAt
    }
  }
`;
export const listFriends = /* GraphQL */ `
  query ListFriends(
    $sender: ID
    $receiver: ModelIDKeyConditionInput
    $filter: ModelFriendFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFriends(
      sender: $sender
      receiver: $receiver
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        timestamp
        sender
        receiver
        accepted
        createdAt
        updatedAt
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
export const friendsByReceiver = /* GraphQL */ `
  query FriendsByReceiver(
    $receiver: ID
    $sender: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFriendFilterInput
    $limit: Int
    $nextToken: String
  ) {
    friendsByReceiver(
      receiver: $receiver
      sender: $sender
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        timestamp
        sender
        receiver
        accepted
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
