import { ZodUtils } from "./Zod"

/**
 * A simple type to ensure that a hex color string takes somewhat the shape
 * of a hex string.
 *
 * While it would be nice to limit the characters in the string to only valid
 * hex characters, it seems the typescript compiler went on strike when such
 * an attempt was made...
 */
export type HexColor = `#${string}`
