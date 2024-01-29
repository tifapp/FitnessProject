import { LocationCoordinates2DSchema } from "@shared-models/Location"
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
import { CallbackCollection } from "@lib/CallbackCollection"

/**
 * An expo geofencing wrapper tuned for event arrivals.
 *
 * There are only 2 instances of this class, `foreground` and `background`.
 *
 * `upcomingArrivalsInstance` is used for tracking event arrivals added through {@link EventArrivalsTracker}.
 *
 * `nonUpcomingArrivalsInstance` is used for tracking event arrivals for non-upcoming events.
 *
 * This distance being geofenced is based on a "walking to the event from the parking lot basis",
 * ie. about 1-2 american football fields.
 */
export class ExpoEventArrivalsGeofencer implements EventArrivalsGeofencer {
  private static readonly taskName = "eventArrivalsTrackingGeofencing"
  private static readonly TaskEventSchema = z.object({
    data: z.object({
      eventType: z.nativeEnum(LocationGeofencingEventType),
      region: LocationCoordinates2DSchema.extend({
        radius: z.number()
      }).passthrough()
    })
  })

  private callbacks = new CallbackCollection<EventArrivalGeofencedRegion>()

  // eslint-disable-next-line no-useless-constructor
  private constructor () {}

  async replaceGeofencedRegions (regions: EventArrivalGeofencedRegion[]) {
    if (regions.length === 0) {
      await stopGeofencingAsync(ExpoEventArrivalsGeofencer.taskName)
    } else {
      await startGeofencingAsync(
        ExpoEventArrivalsGeofencer.taskName,
        regions.map((region) => ({
          ...region.coordinate,
          radius: region.arrivalRadiusMeters,
          state: region.isArrived
            ? LocationGeofencingRegionState.Inside
            : LocationGeofencingRegionState.Outside
        }))
      )
    }
  }

  /**
   * Handle geofencing updates. This method only supports 1 consumer at a time, and
   * calling it twice will unregister the first consumer.
   *
   * @returns a function to unsubscribe from updates.
   */
  onUpdate (handleUpdate: EventArrivalGeofencingCallback) {
    return this.callbacks.add(handleUpdate)
  }

  /**
   * Defines the background geofencing task needed for event arivals. This
   * should only be called in the global scope at the root of the app since
   * expo doesn't render any UI when launching the app in the background.
   */
  defineTask () {
    defineTask(ExpoEventArrivalsGeofencer.taskName, async (arg) => {
      const { data } =
        await ExpoEventArrivalsGeofencer.TaskEventSchema.parseAsync(arg)
      this.callbacks.send({
        coordinate: {
          latitude: data.region.latitude,
          longitude: data.region.longitude
        },
        arrivalRadiusMeters: data.region.radius,
        isArrived: data.eventType === LocationGeofencingEventType.Enter
      })
    })
  }

  /**
   * The {@link ExpoEventArrivalsGeofencer} instance to use for events that start within
   * 24 hours that the user is a part of.
   */
  static readonly shared = new ExpoEventArrivalsGeofencer()
}
