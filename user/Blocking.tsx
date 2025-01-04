import { featureContext } from "@lib/FeatureContext"
import { TiFAPI } from "TiFShared/api"
import { UserID } from "TiFShared/domain-models/User"
import { logger } from "TiFShared/logging"

const log = logger("tif.user.blocking")

export const blockUser = async (
  id: UserID,
  api: TiFAPI = TiFAPI.productionInstance
) => {
  const resp = await api.blockUser({ params: { userId: id } })
  checkForUserNotFound(resp, "block")
}

export const unblockUser = async (
  id: UserID,
  api: TiFAPI = TiFAPI.productionInstance
) => {
  const resp = await api.unblockUser({ params: { userId: id } })
  checkForUserNotFound(resp, "unblock")
}

const checkForUserNotFound = (
  resp: Awaited<ReturnType<typeof TiFAPI.productionInstance.unblockUser>>,
  operation: string
) => {
  if (resp.status === 404) {
    log.error(
      `Unable to ${operation} user, TiF API responded with status code 404.`
    )
    throw new Error(resp.data.error)
  }
}

export const UserBlockingFeature = featureContext({ blockUser, unblockUser })
