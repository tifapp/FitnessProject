import { createDependencyKey } from "./dependencies"

/**
 * A `DependencyKey` to hold the currently logged in user id.
 */
export const userIdDependencyKey = createDependencyKey<string>()
