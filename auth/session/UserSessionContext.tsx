import { QueryHookOptions } from "@lib/ReactQuery"
import { useQuery } from "@tanstack/react-query"
import { createContext, useContext } from "react"

export type UserSessionFunctions = {
  isSignedIn: () => Promise<boolean>
}

const UserSessionContext = createContext<UserSessionFunctions | undefined>(
  undefined
)

export const useIsSignedInQuery = (options?: QueryHookOptions<boolean>) => {
  const { isSignedIn } = useUserSessionContext()
  return useQuery(["isSignedIn"], isSignedIn, options)
}

type UserSessionContextProviderProps = {
  children: JSX.Element
} & UserSessionFunctions

/**
 * Provides functions to check the user's current session.
 */
export const UserSessionContextProvider = ({
  children,
  ...rest
}: UserSessionContextProviderProps) => {
  return (
    <UserSessionContext.Provider value={rest}>
      {children}
    </UserSessionContext.Provider>
  )
}

export const useUserSessionContext = () => useContext(UserSessionContext)!
