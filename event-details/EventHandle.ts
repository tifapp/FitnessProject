import { StringUtils } from "@lib/String"
import { ZodUtils } from "@lib/Zod"
import { LinkifyIt } from "linkify-it"

/**
 * A handle that users can reference other events with.
 *
 * Each event has a handle that is generated from its name similar to user handles.
 * Since {@link UserHandle}s are already referenced through the `@` sign, event handles
 * are referenced via `!`.
 *
 * A valid event handle consists of only letters, numbers, and underscores, but
 * must start with a letter and be at least 1 character long.
 */
export class EventHandle {
  static zodSchema = ZodUtils.createOptionalParseableSchema(EventHandle)

  readonly rawValue: string

  private constructor (rawValue: string) {
    this.rawValue = rawValue
  }

  /**
   * Formats this handle by prefixing it with an "!".
   */
  toString () {
    return `!${this.rawValue}`
  }

  private static REGEX = /^[a-zA-Z]{1}[a-zA-Z0-9_]*$/

  /**
   * Attempts to parse an {@link EventHandle} from a raw string.
   *
   * A valid event handle consists of only letters, numbers, and underscores, but
   * must start with a letter and be at least 1 character long.
   *
   * @param rawValue the raw string to attempt to parse.
   * @returns an {@link EventHandle} instance if valid.
   */
  static parse (rawValue: string) {
    return EventHandle.REGEX.test(rawValue)
      ? new EventHandle(rawValue)
      : undefined
  }
}

/**
 * Adds event handle validation to a linkify config.
 *
 * @param linkify see {@link LinkifyIt}
 */
export const linkifyAddEventHandleValidation = (linkify: LinkifyIt) => {
  linkify.add("!", {
    validate: (text: string, pos: number) => {
      const slice = text.slice(pos)
      const handle = slice.split(/\s/)[0] ?? slice

      if (!EventHandle.parse(handle)) return false
      if (pos >= 2 && !StringUtils.isWhitespaceCharacter(text, pos - 2)) {
        return false
      }
      return handle.length
    },
    normalize: (match) => {
      match.url = "tifapp://event/" + match.url.replace(/^!/, "")
    }
  })
}
