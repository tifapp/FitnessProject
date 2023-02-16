import { UserPosts } from "@lib/posts"
import { GraphQLClient } from "@lib/GraphQLOperations"
import {
  mockGraphQLResponseForStatement,
  unimplementedGraphQLOperations
} from "../helpers/GraphQLOperations"
import { batchGetLikes, getPost, getUser } from "@graphql/queries"
import { Post } from "../../src/models"
import { postIdFromComponents } from "@lib/posts/PostIDComponents"
import { GraphQLUserPosts } from "@lib/posts/UserPosts"

let operations: GraphQLClient
let userPosts: UserPosts

globalThis.savedUsers = {}

describe("GraphQLUserPosts tests", () => {
  beforeEach(() => {
    operations = unimplementedGraphQLOperations
    userPosts = new GraphQLUserPosts(testUserId, operations)
  })

  test("postsWithIds returns an empty map when no ids given", async () => {
    const postMap = await userPosts.postsWithIds([])
    expect(postMap.size).toEqual(0)
  })

  test("postsWithIds queries posts with ids", async () => {
    // TODO: - Ideally, we should only have to mock the response for 1 query.
    mockGraphQLResponseForStatement({
      statement: getUser,
      data: { getUser: { name: blob, isVerfied: true, status: testStatus } },
      operations
    })
    mockGraphQLResponseForStatement({
      statement: batchGetLikes,
      data: { batchGetLikes: [null] },
      operations
    })
    mockGraphQLResponseForStatement({
      statement: getPost,
      data: { getPost: testRawPost },
      operations
    })

    const postMap = await userPosts.postsWithIds([testPostId])
    const post = postMap.get(testPostId)
    expect(post).toMatchObject({
      id: testPostId,
      likesCount: 0,
      repliesCount: 0,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      userId: testUserId,
      username: "Blob",
      description: testRawPost.description,
      likedByYou: false,
      writtenByYou: true,
      taggedUserIds: []
    })
  })
})

const testUserId = "test"
const blob = "Blob|"
const testStatus = "literally dead"
const testPostId = postIdFromComponents({
  creationDate: new Date(0),
  userId: testUserId
})
const testRawPost: Post = {
  id: testPostId,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  userId: testUserId,
  description: "Hello World!"
} as const
