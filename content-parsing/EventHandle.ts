import { ColorString } from "TiFShared/domain-models/ColorString"
import { ZodUtils } from "@lib/utils/Zod"

/**
 * A handle that users can reference other events with.
 *
 * Event handles are not visible to users, rather they are an internal detail
 * that allow users to reference events easily. A raw form of the handle is
 * embedded in text like bios, chat messages, etc. that takes the form:
 *
 * `"!<event-name-length>|<event-id>/<event-color>/<event-name>"`
 *
 * This form is not visible to the user, but rather just the event name is shown in
 * the resulting text to the user.
 */
export class EventHandle {
  static zodSchema = ZodUtils.createOptionalParseableSchema(EventHandle)

  readonly eventId: number
  readonly eventName: string
  readonly color: ColorString

  constructor(eventId: number, eventName: string, color: ColorString) {
    this.eventId = eventId
    this.eventName = eventName
    this.color = color
  }

  /**
   * Formats this event handle back to its raw form.
   */
  toString() {
    return `!${this.eventName.length}|${this.eventId}/${this.color}/${this.eventName}`
  }

  /**
   * Attempts to parse an {@link EventHandle} from a raw string.
   *
   * A valid event handle takes the form `"<event-name-length>|<event-id>/<event-color>/<event-name>"`
   * (note the omitted `"!"` at the start).
   *
   * @param rawValue the raw string to attempt to parse.
   * @param startPosition the position of the string to begin parsing at (defaults to 0).
   * @returns an {@link EventHandle} instance if valid.
   */
  static parse(rawValue: string, startPosition: number = 0) {
    const lengthSeparatorIndex = rawValue.indexOf("|", startPosition)
    if (lengthSeparatorIndex === -1) return undefined

    const firstSlashIndex = rawValue.indexOf("/", lengthSeparatorIndex)
    if (firstSlashIndex === -1) return undefined

    const secondSlashIndex = rawValue.indexOf("/", firstSlashIndex + 1)
    if (secondSlashIndex === -1) return undefined

    const eventId = parseInt(
      rawValue.substring(lengthSeparatorIndex + 1, firstSlashIndex)
    )
    if (Number.isNaN(eventId)) return undefined

    const color = ColorString.parse(
      rawValue.substring(firstSlashIndex + 1, secondSlashIndex)
    )
    if (!color) return undefined

    const nameLength = parseInt(
      rawValue.substring(startPosition, lengthSeparatorIndex)
    )
    if (Number.isNaN(nameLength)) return undefined

    return new EventHandle(
      eventId,
      rawValue.substring(
        secondSlashIndex + 1,
        secondSlashIndex + 1 + nameLength
      ),
      color
    )
  }
}
