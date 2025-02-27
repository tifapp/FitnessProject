import { faker } from "@faker-js/faker"
import { uuidString } from "TiFShared/lib/UUID"
import { BlockListPage, BlockListUser } from "TiFShared/domain-models/BlockList"
import { UserHandle } from "TiFShared/domain-models/User"
import { repeatElements } from "TiFShared/lib/Array"

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1500048993953-d23a436266cf?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1500259783852-0ca9ce8a64dc?q=80&w=2448&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=2565&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
]

export const mockBlockListUser = (): BlockListUser => ({
  id: uuidString(),
  name: faker.name.fullName(),
  handle: [
    UserHandle.zed,
    UserHandle.alvis,
    UserHandle.sillyBitchell
  ].ext.randomElement(),
  profileImageURL: IMAGE_URLS.ext.randomElement()
})

export const mockBlockListPage = (
  userCount: number = 3,
  nextPageToken: string | null = uuidString()
): BlockListPage => ({
  users: repeatElements(userCount, () => mockBlockListUser()),
  nextPageToken
})
