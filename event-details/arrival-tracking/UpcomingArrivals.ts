import AsyncStorage from "@react-native-async-storage/async-storage"
import { EventArrival, EventArrivalsSchema } from "./models"
import { AsyncStorageUtils } from "@lib/AsyncStorage"

/**
 * An interface for storing client-side details on upcoming event arrivals.
 */
export interface UpcomingEventArrivals {
  /**
   * Loads all upcoming event arrivals.
   */
  all: () => Promise<EventArrival[]>

  /**
   * Replaces all upcoming arrivals with the new list of arrivals.
   */
  replaceAll: (arrivals: EventArrival[]) => Promise<void>
}

/**
 * {@link UpcomingEventArrivals} implemented with {@link AsyncStorage}.
 */
export class AsyncStorageUpcomingEventArrivals
implements UpcomingEventArrivals {
  private static KEY = "@upcoming-event-arrivals"

  async all () {
    return await AsyncStorageUtils.parseJSONItem(
      EventArrivalsSchema,
      AsyncStorageUpcomingEventArrivals.KEY
    ).then((arrivals) => arrivals ?? [])
  }

  async replaceAll (arrivals: EventArrival[]) {
    await AsyncStorage.setItem(
      AsyncStorageUpcomingEventArrivals.KEY,
      JSON.stringify(arrivals)
    )
  }
}
