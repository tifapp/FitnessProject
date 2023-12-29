import linkifyIt, { LinkifyIt, Match } from "linkify-it"
import { StringUtils, ToStringable } from "@lib/utils/String"
import { UserHandle } from "./UserHandle"
import { EventHandle } from "./EventHandle"

export type UserHandleLinkifyMatch = Match & { userHandle: UserHandle }

const linkifyAddUserHandleValidation = (linkify: LinkifyIt) => {
  let parsedHandle: UserHandle | undefined
  linkify.add("@", {
    validate: withWhitespaceValidation((text, pos) => {
      const slice = text.slice(pos)
      parsedHandle = UserHandle.optionalParse(slice.split(/\s/, 1)[0] ?? slice)
      return parsedHandle
    }),
    normalize: (match: UserHandleLinkifyMatch) => {
      if (parsedHandle) match.userHandle = parsedHandle
    }
  })
}

export type EventHandleLinkifyMatch = Match & { eventHandle: EventHandle }

const linkifyAddEventHandleValidation = (linkify: LinkifyIt) => {
  let parsedHandle: EventHandle | undefined
  linkify.add("!", {
    validate: withWhitespaceValidation((text, pos) => {
      parsedHandle = EventHandle.parse(text, pos)
      return parsedHandle
    }),
    normalize: (match: EventHandleLinkifyMatch) => {
      if (parsedHandle) match.eventHandle = parsedHandle
    }
  })
}

const withWhitespaceValidation = (
  parse: (text: string, pos: number) => ToStringable | undefined
) => {
  return (text: string, pos: number) => {
    const parsedValue = parse(text, pos)
    if (!parsedValue) return false
    if (pos >= 2 && !StringUtils.isWhitespaceCharacter(text, pos - 2)) {
      return false
    }
    return parsedValue.toString().length
  }
}

/**
 * The app-wide `linkifyIt` config.
 */
const linkify = linkifyIt()

linkifyAddUserHandleValidation(linkify)
linkifyAddEventHandleValidation(linkify)

export { linkify }
