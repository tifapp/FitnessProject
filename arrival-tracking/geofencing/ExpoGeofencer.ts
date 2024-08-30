import {
  startGeofencingAsync,
  LocationGeofencingRegionState,
  stopGeofencingAsync,
  LocationGeofencingEventType
} from "expo-location"
import { defineTask } from "expo-task-manager"
import { z } from "zod"
import {
  EventArrivalGeofencingCallback,
  EventArrivalsGeofencer,
  EventArrivalGeofencedRegion
} from "./Geofencer"
import { CallbackCollection } from "@lib/utils/CallbackCollection"
import { LocationCoordinate2DSchema } from "TiFShared/domain-models/LocationCoordinate2D"

/**
 * An expo geofencing wrapper tuned for event arrivals.
 */
export class ExpoEventArrivalsGeofencer implements EventArrivalsGeofencer {
  private static readonly taskName = "eventArrivalsTrackingGeofencing"
  private static readonly TaskEventSchema = z.object({
    data: z.object({
      eventType: z.nativeEnum(LocationGeofencingEventType),
      region: LocationCoordinate2DSchema.extend({
        radius: z.number()
      }).passthrough()
    })
  })

  private callbacks = new CallbackCollection<EventArrivalGeofencedRegion>()

  // eslint-disable-next-line no-useless-constructor
  private constructor() {}

  async replaceGeofencedRegions(regions: EventArrivalGeofencedRegion[]) {
    if (regions.length === 0) {
      await stopGeofencingAsync(ExpoEventArrivalsGeofencer.taskName)
    } else {
      await startGeofencingAsync(
        ExpoEventArrivalsGeofencer.taskName,
        regions.map((region) => ({
          ...region.coordinate,
          radius: region.arrivalRadiusMeters
        }))
      )
    }
  }

  onUpdate(handleUpdate: EventArrivalGeofencingCallback) {
    return this.callbacks.add(handleUpdate)
  }

  /**
   * Defines the background geofencing task needed for event arivals. This
   * should only be called in the global scope at the root of the app since
   * expo doesn't render any UI when launching the app in the background.
   */
  defineTask() {
    defineTask(ExpoEventArrivalsGeofencer.taskName, async (arg) => {
      const { data } =
        await ExpoEventArrivalsGeofencer.TaskEventSchema.parseAsync(arg)
      this.callbacks.send({
        coordinate: {
          latitude: data.region.latitude,
          longitude: data.region.longitude
        },
        arrivalRadiusMeters: data.region.radius,
        hasArrived: data.eventType === LocationGeofencingEventType.Enter
      })
    })
  }

  static readonly shared = new ExpoEventArrivalsGeofencer()
}
