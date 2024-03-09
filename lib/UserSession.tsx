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
  const { isSignedIn } = useUserSession()
  return useQuery(["isSignedIn"], isSignedIn, options)
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
  thenRender: JSX.Element
  elseRender: JSX.Element
}

/**
 * A component that renders {@link thenRender} if the user is signed in, and
 * {@link elseRender} if they aren't.
 */
export const IfAuthenticated = ({
  thenRender,
  elseRender
}: IfAuthenticatedProps) => {
  const query = useIsSignedInQuery({ initialData: true })
  if (query.data === true) {
    return thenRender
  } else {
    return elseRender
  }
}
