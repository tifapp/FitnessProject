import { SecureStore } from "@lib/SecureStore"

const TOKEN_KEY = "rudeusUserToken"

export class RudeusUserTokenStorage {
  constructor(private readonly secureStore: SecureStore) {}

  async token() {
    return await this.secureStore.getItemAsync(TOKEN_KEY)
  }

  async saveToken(token: string) {
    await this.secureStore.setItemAsync(TOKEN_KEY, token)
  }
}
