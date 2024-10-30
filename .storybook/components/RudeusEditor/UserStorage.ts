import { SecureStore } from "@lib/SecureStore"
import { RudeusUserSchema } from "./Models"
import { jwtBody } from "TiFShared/lib/JWT"

const TOKEN_KEY = "rudeusUserToken"

export class RudeusUserStorage {
  constructor(private readonly secureStore: SecureStore) {}

  async token() {
    return (await this.secureStore.getItemAsync(TOKEN_KEY)) ?? undefined
  }

  async saveToken(token: string) {
    await this.secureStore.setItemAsync(TOKEN_KEY, token)
  }

  async user() {
    const token = await this.token()
    if (!token) return null
    const result = await RudeusUserSchema.safeParseAsync(jwtBody(token))
    return result.data ?? null
  }
}
