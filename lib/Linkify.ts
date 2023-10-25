import linkifyIt from "linkify-it"
import { linkifyAddUserHandleValidation } from "./users"
import { linkifyAddEventHandleValidation } from "@event-details/EventHandle"

/**
 * The app-wide `linkifyIt` config.
 */
const linkify = linkifyIt()

linkifyAddUserHandleValidation(linkify)
linkifyAddEventHandleValidation(linkify)

export { linkify }
