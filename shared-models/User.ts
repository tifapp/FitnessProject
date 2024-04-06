/**
 * Returns the user relations after the current user either blocks or unblocks
 * the related user.
 */
export const toggleBlockUserRelations = (isBlocking: boolean) => {
  return {
    youToThem: isBlocking ? "blocked" : "not-friends",
    // NB: Either the block removes the friendship status, or if they
    // are unblocking then the only possible value is not friends.
    themToYou: "not-friends"
  } as const
}
