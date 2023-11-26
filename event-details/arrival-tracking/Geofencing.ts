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

export type EventArrivalGeofencedCoordinateStatus = "entered" | "exited"

export type EventArrivalGeofencingCallback = (
  coordinate: LocationCoordinate2D,
  status: EventArrivalGeofencedCoordinateStatus
) => void

const taskCallbacks = {
  foreground: undefined as EventArrivalGeofencingCallback | undefined,
  background: undefined as EventArrivalGeofencingCallback | undefined
}

type TaskCallbackKey = keyof typeof taskCallbacks

const taskName = (key: TaskCallbackKey) => {
  return `event-arrivals-geofencing-${key}`
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
  private readonly key: TaskCallbackKey

  private constructor (key: TaskCallbackKey) {
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
  onUpdate (handleUpdate: EventArrivalGeofencingCallback) {
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

/**
 * Starts tasks for observing geofencing updates in the background.
 *
 * **This *must* be called in the global scope.**
 */
export const defineEventArrivalsGeofencingTasks = () => {
  defineEventArrivalsGeofencingTask("background")
  defineEventArrivalsGeofencingTask("foreground")
}

const TaskEventSchema = z.object({
  data: z.object({
    eventType: z.nativeEnum(LocationGeofencingEventType),
    region: LocationCoordinates2DSchema.passthrough()
  })
})

const defineEventArrivalsGeofencingTask = (key: TaskCallbackKey) => {
  defineTask(taskName(key), async (arg) => {
    const { data } = await TaskEventSchema.parseAsync(arg)
    taskCallbacks[key]?.(
      data.region,
      LocationGeofencingEventType.Enter ? "entered" : "exited"
    )
  })
}
