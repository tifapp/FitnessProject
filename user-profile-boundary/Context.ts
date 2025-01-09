import {
  ClientSideEvent,
  clientSideEventFromResponse
} from "@event/ClientSideEvent"
import { featureContext } from "@lib/FeatureContext"
import { AlphaUserStorage } from "@user/alpha"
import { TiFAPI } from "TiFShared/api"
import { UserID, UserProfile } from "TiFShared/domain-models/User"

export type UserProfileDisplayInfo = Omit<
  UserProfile,
  "createdDateTime" | "updatedDateTime"
>

export type UserProfileResult =
  | {
      status: "success"
      user: UserProfileDisplayInfo
    }
  | { status: "blocked-you" | "user-not-found" }

export const userProfile = async (
  userId: UserID,
  api: TiFAPI = TiFAPI.productionInstance,
  storage: AlphaUserStorage = AlphaUserStorage.default
): Promise<UserProfileResult> => {
  const storageData = await storage.user()
  if (storageData && storageData.id === userId) {
    return {
      status: "success",
      user: { ...storageData, relationStatus: "current-user" }
    }
  }
  const resp = await api.getUser({ params: { userId } })
  if (resp.status === 200) {
    return { status: "success", user: resp.data as UserProfileDisplayInfo }
  }
  return { status: resp.data.error }
}

export type UpcomingEventsResult =
  | {
      status: "success"
      events: ClientSideEvent[]
    }
  | { status: "blocked-you" | "user-not-found" }

export const userUpcomingEvents = async (
  userID: UserID,
  api: TiFAPI = TiFAPI.productionInstance
): Promise<UpcomingEventsResult> => {
  const resp = await api.upcomingEvents({ query: { userId: userID } })
  if (resp.status === 200) {
    return {
      status: "success",
      events: resp.data.events.map(clientSideEventFromResponse)
    }
  }
  return { status: resp.data.error }
}

export const UserProfileFeature = featureContext({
  fetchUserProfile: userProfile,
  fetchUpcomingEvents: userUpcomingEvents
})
