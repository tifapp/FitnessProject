import { polyfillWebCrypto } from "expo-standard-web-crypto"
import * as _uuid from "uuid"

polyfillWebCrypto()

/**
 * Generates a v4 UUID string.
 */
export const uuidString = () => _uuid.v4()
