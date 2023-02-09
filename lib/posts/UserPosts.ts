import { UserPost } from "./UserPost"
import { groupUserPosts } from "./helpers"
import {
  GraphQLOperations,
  graphQLOperationsDependencyKey
} from "../GraphQLOperations"
import { loadCapitals } from "@hooks/stringConversion"
import { batchGetLikes, getPost, getUser } from "@graphql/queries"
import { Like, Post } from "src/models"
import { componentsFromPostId, postIdFromComponents } from "./PostIDComponents"
import { createDependencyKey } from "../dependencies"
import { userIdDependencyKey } from "../MiscDependencyKeys"

/**
 * An interface representing all the collection of all of the posts in the app.
 */
export interface UserPosts {
  /**
   * Fetches posts with the given ids.
   *
   * @returns a mapping of post ids to a `UserPost`.
   */
  postsWithIds: (ids: string[]) => Promise<Map<string, UserPost>>
}

/**
 * An implementation of `UserPosts` backed by graphql.
 *
 * @param userId the current logged in user id
 * @param operations the `GraphQLOperations` instance to use
 */
export class GraphQLUserPosts implements UserPosts {
  private userId: string
  private operations: GraphQLOperations

  constructor (userId: string, operations: GraphQLOperations) {
    this.userId = userId
    this.operations = operations
  }

  async postsWithIds (ids: string[]): Promise<Map<string, UserPost>> {
    if (ids.length === 0) return new Map()

    const asyncRawPosts = this.fetchRawPosts(ids)
    const asyncLikes = this.fetchLikes(ids)
    const [rawPosts, likes] = await Promise.all([asyncRawPosts, asyncLikes])

    const usernames = await this.fetchUsernames(
      rawPosts.map((post) => post.userId)
    )

    return groupUserPosts(
      rawPosts.map((post, idx) =>
        this.rawPostToUserPost(post, usernames[idx], likes[idx] !== null)
      )
    )
  }

  private rawPostToUserPost (
    rawPost: Post & { taggedUsers?: string[] | null },
    username: string,
    isLikedByYou: boolean
  ): UserPost {
    return {
      id: postIdFromComponents({
        creationDate: new Date(rawPost.createdAt),
        userId: rawPost.userId
      }),
      likesCount: rawPost.likes ?? 0,
      repliesCount: rawPost.replies ?? 0,
      createdAt: new Date(rawPost.createdAt),
      updatedAt: new Date(rawPost.updatedAt),
      userId: rawPost.userId,
      username,
      description: rawPost.description ?? undefined,
      parentId: rawPost.parentId ?? undefined,
      channel: rawPost.channel ?? undefined,
      imageURL: rawPost.imageURL ?? undefined,
      likedByYou: isLikedByYou,
      writtenByYou: rawPost.userId === this.userId,
      taggedUserIds: rawPost.taggedUsers ?? []
    }
  }

  private async fetchRawPosts (
    postIds: string[]
  ): Promise<(Post & { taggedUsers?: string[] | null })[]> {
    return await Promise.all(
      postIds
        .map((id) => componentsFromPostId(id))
        .map(async (idComponents) => {
          // NB: We force unwrap here because atm all post ids are made up of components.
          // By the time we change this fact, we'll likely no longer need this helper regardless.
          const { creationDate, userId } = idComponents!!
          return await this.operations
            .execute(getPost, {
              createdAt: creationDate.toISOString(),
              userId
            })
            .then((value: any) => value.getPost)
        })
    )
  }

  private async fetchLikes (postIds: string[]): Promise<Like[]> {
    return await this.operations
      .execute<{ batchGetLikes: Like[] }>(batchGetLikes, {
        likes: postIds.map((id) => ({ postId: id }))
      })
      .then((value) => value.batchGetLikes)
  }

  private async fetchUsernames (userIds: string[]): Promise<string[]> {
    return await Promise.all(
      userIds.map(async (id) => await this.fetchUsername(id))
    )
  }

  private async fetchUsername (userId: string): Promise<string> {
    const cachedUsername = globalThis.savedUsers?.[userId]?.name
    if (cachedUsername) return cachedUsername

    const user = await this.operations.execute<{
      getUser: {
        name: string
        status: string
        isVerified: boolean
      }
    }>(getUser, { id: userId })
    const { name, status, isVerified } = user.getUser

    const retName = loadCapitals(name) ?? "Deleted User"
    globalThis.savedUsers[userId] = {
      name: retName,
      status,
      isVerified: isVerified ?? false
    }
    return retName
  }
}

/**
 * A dependency key for a `UserPosts` instance.
 */
export const userPostsDependencyKey = createDependencyKey<UserPosts>(
  (values) => {
    return new GraphQLUserPosts(
      values.get(userIdDependencyKey),
      values.get(graphQLOperationsDependencyKey)
    )
  }
)
