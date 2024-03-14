import React, {
  ReactNode,
  createContext,
  useCallback,
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
  implements InternetConnectionStatus
{
  static readonly shared = new NetInfoInternetConnectionStatus()

  private _isConnected = true

  subscribe(
    callback: (isConnected: boolean) => void
  ): InternetConnectionStatusUnsubscribe {
    return addEventListener((state) => {
      this._isConnected = state.isInternetReachable ?? false
      callback(this._isConnected)
    })
  }

  get isConnected() {
    return this._isConnected
  }
}

const InternetConnectionContext = createContext<InternetConnectionStatus>(
  NetInfoInternetConnectionStatus.shared
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
 * Subscribes to the current {@link InternetConnectionStatus} provided by
 * {@link InternetConnectionStatusProvider}.
 */
export const useIsConnectedToInternet = () => {
  const status = useContext(InternetConnectionContext)
  return useSyncExternalStore(
    useCallback((callback) => status.subscribe(callback), [status]),
    () => status.isConnected
  )
}
