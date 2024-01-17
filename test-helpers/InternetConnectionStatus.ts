import { InternetConnectionStatus } from "@lib/InternetConnection"

export class TestInternetConnectionStatus implements InternetConnectionStatus {
  isConnected: boolean
  private callback?: (isConnected: boolean) => void

  constructor (isConnected: boolean) {
    this.isConnected = isConnected
  }

  subscribe (callback: (isConnected: boolean) => void) {
    this.callback = callback
    return () => (this.callback = undefined)
  }

  publishIsConnected (isConnected: boolean) {
    this.isConnected = isConnected
    this.callback?.(isConnected)
  }
}
