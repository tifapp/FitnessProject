import { StringUtils } from "@lib/utils/String"
import { LocationCoordinate2D, LocationCoordinates2DSchema } from "@location"
import {
  LocationGeofencingEventType,
  startGeofencingAsync,
  stopGeofencingAsync
} from "expo-location"
import { defineTask } from "expo-task-manager"
import { z } from "zod"
import { EventArrival } from "./Models"

export type EventArrivalGeofencedCoordinateStatus = "entered" | "exited"

export type EventArrivalGeofencingUpdate = {
  coordinate: LocationCoordinate2D
  status: EventArrivalGeofencedCoordinateStatus
}

export type EventArrivalGeofencingCallback = (
  update: EventArrivalGeofencingUpdate
) => void

export type EventArrivalGeofencingUnsubscribe = () => void

/**
 * A geofencer interface explicitly tuned for event arrivals.
 */
export interface EventArrivalsGeofencer {
  /**
   * Replaces all coordinates currently being geofenced.
   */
  replaceGeofencedArrivals: (coordinates: EventArrival[]) => Promise<void>

  /**
   * Registers a callback that listens for geofencing updates.
   */
  onUpdate: (
    handleUpdate: EventArrivalGeofencingCallback
  ) => EventArrivalGeofencingUnsubscribe
}

const taskCallbacks = {
  nonUpcoming: undefined as EventArrivalGeofencingCallback | undefined,
  upcoming: undefined as EventArrivalGeofencingCallback | undefined
}

type TaskCallbackKey = keyof typeof taskCallbacks

const taskName = (key: TaskCallbackKey) => {
  return `eventArrivalsGeofencing${StringUtils.capitalizeFirstLetter(key)}`
}

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
  private readonly key: TaskCallbackKey

  private constructor (key: TaskCallbackKey) {
    this.key = key
  }

  async replaceGeofencedArrivals (arrivals: EventArrival[]) {
    if (arrivals.length === 0) {
      await this.stopGeofencing()
    } else {
      await startGeofencingAsync(
        taskName(this.key),
        arrivals.map((arrival) => ({
          ...arrival.coordinate,
          radius: arrival.arrivalRadiusMeters
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
   *
   * @returns a function to unsubscribe from updates.
   */
  onUpdate (handleUpdate: EventArrivalGeofencingCallback) {
    taskCallbacks[this.key] = handleUpdate
    return () => {
      taskCallbacks[this.key] = undefined
    }
  }

  /**
   * The {@link ExpoEventArrivalsGeofencer} instance to use when the user wants to check
   * their "arrival" at events they are not apart of or are in the distant future.
   */
  static nonUpcomingArrivalsInstance = new ExpoEventArrivalsGeofencer(
    "nonUpcoming"
  )

  /**
   * The {@link ExpoEventArrivalsGeofencer} instance to use for events that start within
   * 24 hours that the user is a part of.
   */
  static upcomingArrivalsInstance = new ExpoEventArrivalsGeofencer("upcoming")
}

/**
 * Starts tasks for observing geofencing updates in the background.
 *
 * **This *must* be called in the global scope.**
 */
export const defineEventArrivalsGeofencingTasks = () => {
  defineEventArrivalsGeofencingTask("upcoming")
  defineEventArrivalsGeofencingTask("nonUpcoming")
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
    taskCallbacks[key]?.({
      coordinate: data.region,
      status: LocationGeofencingEventType.Enter ? "entered" : "exited"
    })
  })
}
