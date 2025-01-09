import { UserID } from "TiFShared/domain-models/User"

export const userProfileQueryKey = (id: UserID, elements: unknown[] = []) => {
  return ["userProfile", id, ...elements]
}
