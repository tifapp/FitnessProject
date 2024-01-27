/* eslint-disable func-call-spacing */
import { uuidString } from "@lib/utils/UUID"
import { EventRegion, areEventRegionsEqual } from "@shared-models/Event"

/**
 * A shared base helper class for handling a list of subscriptions to the
 * arrival state of a region.
 */
export class RegionState {
  readonly region: EventRegion
  private _hasArrived: boolean

  private callbacks = new Map<string, (hasArrived: boolean) => void>()

  get hasArrived () {
    return this._hasArrived
  }

  get isActive () {
    return this.hasSubscribers
  }

  get hasSubscribers () {
    return this.callbacks.size > 0
  }

  constructor (region: EventRegion, hasArrived: boolean) {
    this.region = region
    this._hasArrived = hasArrived
  }

  protected publishUpdate (hasArrived: boolean) {
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

export const stateForRegion = <State extends RegionState>(
  region: EventRegion,
  states: State[]
) => {
  return states.find((state) => areEventRegionsEqual(region, state.region))
}

export const filterStateIfInactive = <State extends RegionState>(
  state: State,
  states: State[]
) => {
  if (state.isActive) return states
  return states.filter((innerState) => {
    return !areEventRegionsEqual(innerState.region, state.region)
  })
}
