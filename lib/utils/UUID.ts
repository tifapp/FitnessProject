// import { polyfillWebCrypto } from "expo-standard-web-crypto"
// import * as _uuid from "uuid"

// polyfillWebCrypto()

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (char) {
      const random = (Math.random() * 16) | 0
      const value = char === "x" ? random : (random & 0x3) | 0x8
      return value.toString(16)
    }
  )
}

/**
 * Generates a v4 UUID string.
 */
export const uuidString = () => uuidv4()
