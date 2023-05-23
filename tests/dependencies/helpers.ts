import { DependencyValues } from "@lib/dependencies"

/**
 * Only for use in dependencies tests which need to test default value behavior.
 */
export const _negateDependencyKeyDefaultValueTestContext = () => {
  beforeAll(() => (DependencyValues.isInTestContext = false))
  afterAll(() => (DependencyValues.isInTestContext = true))
}
