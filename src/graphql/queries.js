/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPost = /* GraphQL */ `
  query GetPost($id: ID!) {
    getPost(id: $id) {
      id
      name
      email
      description
      group
      year
      month
      day
      hour
      minute
      timeOfDay
      createdAt
      updatedAt
    }
  }
`;
export const listPosts = /* GraphQL */ `
  query ListPosts(
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        email
        description
        group
        year
        month
        day
        hour
        minute
        timeOfDay
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
