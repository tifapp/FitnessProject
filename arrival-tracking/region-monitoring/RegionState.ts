import { CallbackCollection } from "@lib/CallbackCollection"
import {
  EventRegion,
  areEventRegionsEqual
} from "TiFShared/domain-models/Event"

/**
 * A shared base helper class for handling a list of subscriptions to the
 * arrival state of a region.
 */
export class RegionState {
  readonly region: EventRegion
  private _hasArrived: boolean

  private callbacks = new CallbackCollection<boolean>()

  get hasArrived() {
    return this._hasArrived
  }

  get isActive() {
    return this.hasSubscribers
  }

  get hasSubscribers() {
    return this.callbacks.count > 0
  }

  constructor(region: EventRegion, hasArrived: boolean) {
    this.region = region
    this._hasArrived = hasArrived
  }

  protected publishUpdate(hasArrived: boolean) {
    this._hasArrived = hasArrived
    this.callbacks.send(hasArrived)
  }

  protected subscribe(callback: (hasArrived: boolean) => void) {
    return this.callbacks.add(callback)
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
