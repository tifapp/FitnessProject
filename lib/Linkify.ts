import linkifyIt from "linkify-it"
import { isValidUserHandle } from "./users"
import { StringUtils } from "./String"

/**
 * The app-wide `linkifyIt` config.
 */
const linkify = linkifyIt()

const validateUserHandle = (text: string, pos: number) => {
  const slice = text.slice(pos - 1)
  const handle = slice.split(/\s/)[0] ?? slice

  if (!isValidUserHandle(handle)) return false
  if (pos >= 2 && !StringUtils.isWhitespaceCharacter(text, pos - 2)) {
    return false
  }
  return handle.length - 1
}

linkify.add("@", {
  validate: validateUserHandle,
  normalize: (match) => {
    match.url = "tifapp://user/" + match.url.replace(/^@/, "")
  }
})

export { linkify }
