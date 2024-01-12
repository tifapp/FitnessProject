import {
  EventArrivalsGeofencer,
  EventArrivalGeofencingCallback,
  EventArrivalGeofencedRegion
} from "./Geofencer"

export class TestEventArrivalsGeofencer implements EventArrivalsGeofencer {
  private updateCallback?: EventArrivalGeofencingCallback
  geofencedRegions = [] as EventArrivalGeofencedRegion[]

  get hasSubscriber () {
    return !!this.updateCallback
  }

  async replaceGeofencedRegions (regions: EventArrivalGeofencedRegion[]) {
    this.geofencedRegions = regions
  }

  sendUpdate (update: EventArrivalGeofencedRegion) {
    this.updateCallback?.(update)
  }

  reset () {
    this.updateCallback = undefined
    this.geofencedRegions = []
  }

  onUpdate (handleUpdate: EventArrivalGeofencingCallback) {
    this.updateCallback = handleUpdate
    return () => {
      this.updateCallback = undefined
    }
  }
}
