import { TiFAPI } from "TiFShared/api"
import { UserID } from "TiFShared/domain-models/User"
import { mergeWithPartial } from "TiFShared/lib/Object"
import { logger } from "TiFShared/logging"
import React, { ReactNode, createContext, useContext } from "react"

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

export type UserBlockingContextValues = {
  blockUser: (id: UserID) => Promise<void>
  unblockUser: (id: UserID) => Promise<void>
}

const BlockingContext = createContext<UserBlockingContextValues>({
  blockUser,
  unblockUser
})

export const useUserBlocking = () => useContext(BlockingContext)

export type UserBlockingProviderProps = Partial<UserBlockingContextValues> & {
  children: ReactNode
}

export const UserBlockingProvider = ({
  children,
  ...values
}: UserBlockingProviderProps) => (
  <BlockingContext.Provider value={mergeWithPartial(useUserBlocking(), values)}>
    {children}
  </BlockingContext.Provider>
)
