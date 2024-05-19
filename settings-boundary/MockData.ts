import { faker } from "@faker-js/faker"
import { randomlyNull } from "@lib/utils/Random"
import { uuidString } from "@lib/utils/UUID"
import { UserHandle } from "TiFShared/domain-models/User"
import { BlockListUser } from "./BlockList"
import { repeatElements } from "TiFShared/lib/Array"

export const mockBlockListUser = (): BlockListUser => ({
  id: uuidString(),
  username: faker.name.fullName(),
  handle: [
    UserHandle.zed,
    UserHandle.alvis,
    UserHandle.sillyBitchell
  ].ext.randomElement(),
  profileImageURL: randomlyNull(faker.internet.url())
})

export const mockBlockListPage = (
  userCount: number = 3,
  nextPageToken: string | null = uuidString()
) => ({
  users: repeatElements(userCount, () => mockBlockListUser()),
  nextPageToken
})
