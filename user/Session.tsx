import { QueryHookOptions } from "@lib/ReactQuery"
import { useQuery } from "@tanstack/react-query"
import { UserID } from "TiFShared/domain-models/User"
import { ReactNode, createContext, useContext } from "react"
import { ContactInfoFormattable } from "./privacy"

export type UserSession = {
  id: UserID
  primaryContactInfo: ContactInfoFormattable
}

export type UserSessionFunctions = {
  userSession: () => Promise<UserSession>
}

const UserSessionContext = createContext<UserSessionFunctions | undefined>(
  undefined
)

export const useUserSessionQuery = (
  options?: QueryHookOptions<UserSession>
) => {
  const { userSession } = useUserSession()
  return useQuery(["userSession"], async () => await userSession(), options)
}

export const useIsSignedIn = () => {
  return useUserSessionQuery().isSuccess
}

type UserSessionProviderProps = {
  children: JSX.Element
} & UserSessionFunctions

/**
 * Provides functions to check the user's current session.
 */
export const UserSessionProvider = ({
  children,
  ...rest
}: UserSessionProviderProps) => {
  return (
    <UserSessionContext.Provider value={rest}>
      {children}
    </UserSessionContext.Provider>
  )
}

export const useUserSession = () => useContext(UserSessionContext)!

export type IfAuthenticatedProps = {
  thenRender: ReactNode | ((session: UserSession) => ReactNode)
  elseRender?: ReactNode
}

/**
 * A component that renders {@link thenRender} if the user is signed in, and
 * {@link elseRender} if they aren't.
 */
export const IfAuthenticated = ({
  thenRender,
  elseRender
}: IfAuthenticatedProps) => {
  const query = useUserSessionQuery()
  if (query.data) {
    return thenRender instanceof Function ? thenRender(query.data) : thenRender
  } else {
    return elseRender
  }
}
