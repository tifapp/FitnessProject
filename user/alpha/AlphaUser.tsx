import { InMemorySecureStore, SecureStore } from "@lib/SecureStore"
import {
  CallbackCollection,
  CallbackCollectionUnsubscribe
} from "@lib/utils/CallbackCollection"
import { UserSession, UserSessionProvider } from "@user/Session"
import { EmailAddress } from "@user/privacy"
import { TiFAPI } from "TiFShared/api"
import {
  UserHandle,
  UserHandleSchema,
  UserID,
  UserIDSchema
} from "TiFShared/domain-models/User"
import { jwtBody } from "TiFShared/lib/JWT"
import * as ExpoSecureStore from "expo-secure-store"
import { useCallback } from "react"
import { z } from "zod"

/**
 * All the data associated with an Alpha User.
 *
 * Alpha users have limited info (only a name, id, and handle), and cannot edit their profiles
 * after creation.
 *
 * All alpha users have a non-expiring access token to the TiFAPI. However, this token is the
 * only access token linked to their account, so their account is lost if the token is lost.
 */
export type AlphaUser = {
  name: string
  id: UserID
  handle: UserHandle
  token: string
}

const ALPHA_USER_STORAGE_KEY = "tif.alpha.user.storage"

const AlphaUserTokenBodySchema = z.object({
  name: z.string().min(1),
  handle: UserHandleSchema,
  id: UserIDSchema
})

/**
 * A class that stores user data for Alpha users.
 */
export class AlphaUserStorage {
  private subscribers = new CallbackCollection<AlphaUser>()

  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly _store: SecureStore) {}

  /**
   * Returns the alpha user details if they exist.
   */
  async user(): Promise<AlphaUser | undefined> {
    const token = await this._store.getItemAsync(ALPHA_USER_STORAGE_KEY)
    if (!token) return undefined
    const userResult = await AlphaUserTokenBodySchema.safeParseAsync(
      jwtBody(token)
    )
    if (!userResult.success) return undefined
    return { ...userResult.data, token }
  }

  /**
   * Removes the current JWT access token from the current store.
   */
  async removeUserToken(): Promise<void> {
    const token = await this._store.getItemAsync(ALPHA_USER_STORAGE_KEY)
    if (!token) return
    return await this._store.deleteItemAsync(ALPHA_USER_STORAGE_KEY)
  }

  /**
   * Stores the JWT access token containing the alpha user details in its payload.
   */
  async store(token: string) {
    await this._store.setItemAsync(ALPHA_USER_STORAGE_KEY, token)
    const userResult = await AlphaUserTokenBodySchema.safeParseAsync(
      jwtBody(token)
    )
    if (userResult.success) {
      this.subscribers.send({ ...userResult.data, token })
    }
  }

  subscribe(fn: (user: AlphaUser) => void) {
    this.user().then((user) => {
      if (user) fn(user)
    })
    return this.subscribers.add(fn)
  }

  /**
   * The default storage instance which stores user data to the keychain.
   */
  static default = new AlphaUserStorage(ExpoSecureStore)

  /**
   * Returns an in-memory storage instance.
   */
  static ephemeral(initialUser?: AlphaUser) {
    const store = new InMemorySecureStore()
    if (initialUser) {
      store.map.set(ALPHA_USER_STORAGE_KEY, initialUser?.token)
    }
    return new AlphaUserStorage(store)
  }
}

/**
 * Registeres an alpha user with the API.
 *
 * @param name The name to register the user with.
 * @param storage The {@link AlphaUserStorage} instance to save the registered user to.
 * @param api The {@link TiFAPI} instance to use.
 */
export const registerAlphaUser = async (
  name: string,
  storage: AlphaUserStorage = AlphaUserStorage.default,
  api: TiFAPI = TiFAPI.productionInstance
): Promise<AlphaUser> => {
  const resp = await api.createCurrentUserProfile({ body: { name } })
  if (resp.status === 400) {
    throw new Error("invalid name")
  }
  await storage.store(resp.data.token)
  return resp.data
}

export type AlphaUserSessionProviderProps = {
  storage?: AlphaUserStorage
  children: JSX.Element
}

/**
 * A user session provider wrapper that loads alpha user data as the session.
 */
export const AlphaUserSessionProvider = ({
  storage = AlphaUserStorage.default,
  children
}: AlphaUserSessionProviderProps) => (
  <UserSessionProvider
    userSession={useCallback(async () => {
      const user = await storage.user()
      if (!user) throw new Error("No stored alpha user.")
      return alphaUserSession(user)
    }, [storage])}
  >
    {children}
  </UserSessionProvider>
)

export const alphaUserSession = (user: AlphaUser): UserSession => {
  // NB: Alpha users don't need to register with their email, so use a mock.
  return { ...user, primaryContactInfo: EmailAddress.alphaUser }
}
