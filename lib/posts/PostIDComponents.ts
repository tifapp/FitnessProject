/**
 * Components that make up a post id string.
 *
 * A post id string takes the following form: "{creation date iso formatted}#{user id}".
 */
export type PostIDComponents = {
  creationDate: Date;
  userId: string;
};

/**
 * Creates a post id string from its components.
 *
 * A post id string takes the following form: "{creation date iso formatted}#{user id}".
 */
export const postIdFromComponents = ({
  creationDate,
  userId,
}: PostIDComponents): string => {
  return `${creationDate.toISOString()}#${userId}`;
};

/**
 * Extracts the components from a post id string if able.
 *
 * A post id string takes the following form: "{creation date iso formatted}#{user id}".
 */
export const componentsFromPostId = (
  postId: string
): PostIDComponents | undefined => {
  const splits = postId.split("#");
  if (splits.length !== 2) return undefined;

  const [dateString, userId] = splits;
  const date = Date.parse(dateString);
  if (isNaN(date)) return undefined;

  return {
    creationDate: new Date(date),
    userId: userId,
  };
};
