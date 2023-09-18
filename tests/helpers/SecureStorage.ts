import { SECURE_STORAGE_KEY_PREFIX, SecureStorage } from "@lib/SecureStorage"
import * as ExpoSecureStore from "expo-secure-store"

export class TestSecureStorage implements SecureStorage {
  private TestAmplifyStore = new Map<string, string>()

  // @needsAudit
  /**
   * The data in the keychain item cannot be accessed after a restart until the device has been
   * unlocked once by the user. This may be useful if you need to access the item when the phone
   * is locked.
   */
  AFTER_FIRST_UNLOCK: ExpoSecureStore.KeychainAccessibilityConstant =
    ExpoSecureStore.AFTER_FIRST_UNLOCK

  // @needsAudit
  /**
   * Similar to `AFTER_FIRST_UNLOCK`, except the entry is not migrated to a new device when restoring
   * from a backup.
   */
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: ExpoSecureStore.KeychainAccessibilityConstant =
    ExpoSecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY

  // @needsAudit
  /**
   * The data in the keychain item can always be accessed regardless of whether the device is locked.
   * This is the least secure option.
   */
  ALWAYS: ExpoSecureStore.KeychainAccessibilityConstant = ExpoSecureStore.ALWAYS

  // @needsAudit
  /**
   * Similar to `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, except the user must have set a passcode in order to
   * store an entry. If the user removes their passcode, the entry will be deleted.
   */
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: ExpoSecureStore.KeychainAccessibilityConstant =
    ExpoSecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY

  // @needsAudit
  /**
   * Similar to `ALWAYS`, except the entry is not migrated to a new device when restoring from a backup.
   */
  ALWAYS_THIS_DEVICE_ONLY: ExpoSecureStore.KeychainAccessibilityConstant =
    ExpoSecureStore.ALWAYS_THIS_DEVICE_ONLY

  // @needsAudit
  /**
   * The data in the keychain item can be accessed only while the device is unlocked by the user.
   */
  WHEN_UNLOCKED: ExpoSecureStore.KeychainAccessibilityConstant =
    ExpoSecureStore.WHEN_UNLOCKED

  // @needsAudit
  /**
   * Similar to `WHEN_UNLOCKED`, except the entry is not migrated to a new device when restoring from
   * a backup.
   */
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: ExpoSecureStore.KeychainAccessibilityConstant =
    ExpoSecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY

  async setItemAsync (
    key: string,
    value: string,
    options?: ExpoSecureStore.SecureStoreOptions | undefined
  ) {
    this.TestAmplifyStore.set(SECURE_STORAGE_KEY_PREFIX + key, value)
  }

  async getItemAsync (key: string) {
    let result = this.TestAmplifyStore.get(key) || null
    if (!result) {
      result = null
    }
    return result
  }

  async deleteItemAsync (key: string) {
    this.TestAmplifyStore.delete(SECURE_STORAGE_KEY_PREFIX + key)
  }

  async isAvailableAsync () {
    return true
  }
}
