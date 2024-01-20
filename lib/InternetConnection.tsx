import React, {
  ReactNode,
  createContext,
  useContext,
  useSyncExternalStore
} from "react"
import { addEventListener } from "@react-native-community/netinfo"

export type InternetConnectionStatusUnsubscribe = () => void

/**
 * An interface for observing whether or not the user is connected to the internet.
 */
export interface InternetConnectionStatus {
  subscribe(
    callback: (isConnected: boolean) => void
  ): InternetConnectionStatusUnsubscribe

  get isConnected(): boolean
}

/**
 * An {@link InternetConnectionStatus} using netinfo.
 */
export class NetInfoInternetConnectionStatus
implements InternetConnectionStatus {
  private _isConnected = true

  subscribe (
    callback: (isConnected: boolean) => void
  ): InternetConnectionStatusUnsubscribe {
    return addEventListener((state) => {
      this._isConnected = state.isInternetReachable ?? false
      callback(this._isConnected)
    })
  }

  get isConnected () {
    return this._isConnected
  }
}

const InternetConnectionContext = createContext<InternetConnectionStatus>(
  new NetInfoInternetConnectionStatus()
)

export type InternetConnectionStatusProviderProps = {
  status: InternetConnectionStatus
  children: ReactNode
}

export const InternetConnectionStatusProvider = ({
  status,
  children
}: InternetConnectionStatusProviderProps) => (
  <InternetConnectionContext.Provider value={status}>
    {children}
  </InternetConnectionContext.Provider>
)

/**
 * Subscribes to the current {@link InternetConnectionStatus} provided by {@link InternetConnectionStatusProvider}.
 */
export const useIsConnectedToInternet = () => {
  const status = useContext(InternetConnectionContext)
  return useSyncExternalStore(
    (callback) => status.subscribe(callback),
    () => status.isConnected
  )
}