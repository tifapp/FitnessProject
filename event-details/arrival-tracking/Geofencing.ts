import { yardsToMeters } from "@lib/Math"
import {
  LocationCoordinate2D,
  LocationCoordinates2DSchema
} from "@lib/location"
import {
  LocationGeofencingEventType,
  startGeofencingAsync,
  stopGeofencingAsync
} from "expo-location"
import { defineTask } from "expo-task-manager"
import { z } from "zod"

export type GeofencedCoordinateStatus = "entered" | "exited"

export type GeofencingCallback = (
  coordinate: LocationCoordinate2D,
  status: GeofencedCoordinateStatus
) => void

const taskCallbacks = {
  foreground: undefined as GeofencingCallback | undefined,
  background: undefined as GeofencingCallback | undefined
}

/**
 * An expo geofencing wrapper tuned for event arrivals.
 *
 * There are only 2 instances of this class, `foreground` and `background`.
 *
 * `background` is used for tracking event arrivals added through {@link EventArrivalsTracker}.
 *
 * `foreground` is used for tracking event arrivals for non-upcoming events, and thus only runs in the foreground.
 *
 * This distance being geofenced is based on a "walking to the event from the parking lot basis",
 * ie. about 1-2 american football fields.
 */
export class EventArrivalsGeofencer {
  private readonly key: keyof typeof taskCallbacks

  private constructor (key: keyof typeof taskCallbacks) {
    this.key = key
  }

  async replaceGeofencedCoordinates (coordinates: LocationCoordinate2D[]) {
    if (coordinates.length === 0) {
      await this.stopGeofencing()
    } else {
      await startGeofencingAsync(
        taskName(this.key),
        coordinates.map((coordinate) => ({
          ...coordinate,
          radius: yardsToMeters(125)
        }))
      )
    }
  }

  async stopGeofencing () {
    await stopGeofencingAsync(taskName(this.key))
  }

  /**
   * Handle geofencing updates. This method only supports 1 consumer at a time, and
   * calling it twice will unregister the first consumer.
   */
  onUpdate (handleUpdate: GeofencingCallback) {
    taskCallbacks[this.key] = handleUpdate
  }

  /**
   * The {@link EventArrivalsGeofencer} instance to use when the user wants to check
   * their "arrival" at events they are not apart of.
   */
  static foreground = new EventArrivalsGeofencer("foreground")

  /**
   * The {@link EventArrivalsGeofencer} instance to use for handling arrival notifications
   * for events that the user has joined in the background.
   */
  static background = new EventArrivalsGeofencer("background")
}

const TaskEventSchema = z.object({
  data: z.object({
    eventType: z.nativeEnum(LocationGeofencingEventType),
    region: LocationCoordinates2DSchema.passthrough()
  })
})

const taskName = (key: keyof typeof taskCallbacks) => {
  return `event-arrivals-geofencing-${key}`
}

const defineEventArrivalsGeofencingTask = (key: keyof typeof taskCallbacks) => {
  defineTask(taskName(key), async (arg) => {
    const { data } = await TaskEventSchema.parseAsync(arg)
    taskCallbacks[key]?.(
      data.region,
      LocationGeofencingEventType.Enter ? "entered" : "exited"
    )
  })
}

// NB: According to expo, we must make these calls in global scope.
defineEventArrivalsGeofencingTask("background")
defineEventArrivalsGeofencingTask("foreground")
