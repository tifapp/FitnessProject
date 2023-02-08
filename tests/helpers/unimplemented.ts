/**
 * Causes a test failure if called.
 *
 * @param tag a simple name to identify the unimplemented function that was called
 */
export const unimplemented = (tag: string): never => {
  return fail(`${tag} is unimplemented!`);
};
