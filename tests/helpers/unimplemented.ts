/**
 * Causes a test failure if called.
 *
 * @deprecated Use simple `jest.fn` calls instead
 * @param tag a simple name to identify the unimplemented function that was called
 */
export const unimplemented = (tag: string) => {
  // eslint-disable-next-line no-undef
  return fail(`${tag} is unimplemented!`)
}
