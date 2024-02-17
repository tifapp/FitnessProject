import { useIsSignedInQuery } from "./UserSessionContext"

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
  const query = useIsSignedInQuery()
  if (query.data === true) {
    return thenRender
  } else {
    return elseRender
  }
}
