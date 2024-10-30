import { SecureStore } from "@lib/SecureStore"
import { RudeusUserSchema } from "./Models"

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

const jwtBody = (token: string) => {
  const parts = token.split(".")
  if (parts.length !== 3) return null
  const bodyBase64 = parts[1]
  const bodyJson = atob(bodyBase64.replace(/-/g, "+").replace(/_/g, "/"))
  return JSON.parse(bodyJson)
}
