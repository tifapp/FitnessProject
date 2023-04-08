/**
 * Only for use in dependencies tests which need to test default value behavior.
 */
export const _negateDependencyKeyDefaultValueTestContext = () => {
  let jestId: string | undefined
  beforeAll(() => {
    jestId = process.env.JEST_WORKER_ID
    process.env.JEST_WORKER_ID = undefined
  })
  afterAll(() => (process.env.JEST_WORKER_ID = jestId))
}
