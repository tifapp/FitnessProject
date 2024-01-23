/* eslint-disable func-call-spacing */
import { uuidString } from "@lib/utils/UUID"
import { EventRegion, areEventRegionsEqual } from "@shared-models/Event"

export class BaseRegionState {
  readonly region: EventRegion
  private _hasArrived: boolean

  private callbacks = new Map<string, (hasArrived: boolean) => void>()

  get hasArrived () {
    return this._hasArrived
  }

  get hasSubscribers () {
    return this.callbacks.size > 0
  }

  constructor (region: EventRegion, hasArrived: boolean) {
    this.region = region
    this._hasArrived = hasArrived
  }

  publishUpdate (hasArrived: boolean) {
    this._hasArrived = hasArrived
    this.callbacks.forEach((callback) => callback(hasArrived))
  }

  protected subscribe (callback: (hasArrived: boolean) => void) {
    const id = uuidString()
    this.callbacks.set(id, callback)
    return () => {
      this.callbacks.delete(id)
    }
  }
}

export const stateForRegion = <RegionState extends BaseRegionState>(
  region: EventRegion,
  states: RegionState[]
) => {
  return states.find((state) => areEventRegionsEqual(region, state.region))
}
