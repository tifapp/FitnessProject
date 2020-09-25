/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreatePicture = /* GraphQL */ `
  subscription OnCreatePicture($owner: String!) {
    onCreatePicture(owner: $owner) {
      id
      file {
        bucket
        key
        region
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdatePicture = /* GraphQL */ `
  subscription OnUpdatePicture($owner: String!) {
    onUpdatePicture(owner: $owner) {
      id
      file {
        bucket
        key
        region
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeletePicture = /* GraphQL */ `
  subscription OnDeletePicture($owner: String!) {
    onDeletePicture(owner: $owner) {
      id
      file {
        bucket
        key
        region
      }
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onCreatePost = /* GraphQL */ `
  subscription OnCreatePost {
    onCreatePost {
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
export const onUpdatePost = /* GraphQL */ `
  subscription OnUpdatePost {
    onUpdatePost {
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
export const onDeletePost = /* GraphQL */ `
  subscription OnDeletePost {
    onDeletePost {
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
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
      id
      pictureURL
      name
      age
      gender
      bio
      goals
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
      id
      pictureURL
      name
      age
      gender
      bio
      goals
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
      id
      pictureURL
      name
      age
      gender
      bio
      goals
      createdAt
      updatedAt
    }
  }
`;
