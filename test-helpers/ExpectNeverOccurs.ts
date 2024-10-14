import { waitFor } from "@testing-library/react-native"

/**
 * Expects that an assertion always fails asynchronously.
 *
 * From: https://stackoverflow.com/questions/68118941/how-to-wait-for-something-not-to-happen-in-testing-library
 */
export const verifyNeverOccurs = async (
  expectation: () => unknown,
  timeoutMillis: number = 100
) => {
  await expect(
    waitFor(expectation, { timeout: timeoutMillis })
  ).rejects.toThrow()
}
