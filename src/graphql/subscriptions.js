/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateFriendRequest = /* GraphQL */ `
  subscription OnCreateFriendRequest($sender: String!, $receiver: String!) {
    onCreateFriendRequest(sender: $sender, receiver: $receiver) {
      sender
      receiver
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateFriendRequest = /* GraphQL */ `
  subscription OnUpdateFriendRequest($sender: String!, $receiver: String!) {
    onUpdateFriendRequest(sender: $sender, receiver: $receiver) {
      sender
      receiver
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteFriendRequest = /* GraphQL */ `
  subscription OnDeleteFriendRequest($sender: String!, $receiver: String!) {
    onDeleteFriendRequest(sender: $sender, receiver: $receiver) {
      sender
      receiver
      createdAt
      updatedAt
    }
  }
`;
export const onCreateFriendship = /* GraphQL */ `
  subscription OnCreateFriendship {
    onCreateFriendship {
      sender
      receiver
      timestamp
      hifives
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateFriendship = /* GraphQL */ `
  subscription OnUpdateFriendship {
    onUpdateFriendship {
      sender
      receiver
      timestamp
      hifives
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteFriendship = /* GraphQL */ `
  subscription OnDeleteFriendship {
    onDeleteFriendship {
      sender
      receiver
      timestamp
      hifives
      createdAt
      updatedAt
    }
  }
`;
export const onCreateGroup = /* GraphQL */ `
  subscription OnCreateGroup {
    onCreateGroup {
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
export const onUpdateGroup = /* GraphQL */ `
  subscription OnUpdateGroup {
    onUpdateGroup {
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
export const onDeleteGroup = /* GraphQL */ `
  subscription OnDeleteGroup {
    onDeleteGroup {
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
export const onCreatePost = /* GraphQL */ `
  subscription OnCreatePost {
    onCreatePost {
      timestamp
      userId
      description
      group
      createdAt
      updatedAt
    }
  }
`;
export const onUpdatePost = /* GraphQL */ `
  subscription OnUpdatePost {
    onUpdatePost {
      timestamp
      userId
      description
      group
      createdAt
      updatedAt
    }
  }
`;
export const onDeletePost = /* GraphQL */ `
  subscription OnDeletePost {
    onDeletePost {
      timestamp
      userId
      description
      group
      createdAt
      updatedAt
    }
  }
`;
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
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
