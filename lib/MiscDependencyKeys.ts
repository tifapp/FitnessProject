import { createDependencyKey } from "./dependencies"

/**
 * A dependency key to hold the currently logged in user id.
 */
export const userIdDependencyKey = createDependencyKey<string>()
