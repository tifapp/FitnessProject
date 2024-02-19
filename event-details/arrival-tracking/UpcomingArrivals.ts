import AsyncStorage from "@react-native-async-storage/async-storage"
import { AsyncStorageUtils } from "@lib/utils/AsyncStorage"
import {
  EventArrivalRegion,
  EventArrivalRegionsSchema
} from "@shared-models/EventArrivals"
import { getBackgroundPermissionsAsync } from "expo-location"

/**
 * An interface for storing client-side details on upcoming event arrivals.
 */
export interface UpcomingEventArrivals {
  /**
   * Loads all upcoming event arrivals.
   */
  all: () => Promise<EventArrivalRegion[]>

  /**
   * Replaces all upcoming arrivals with the new list of arrivals.
   */
  replaceAll: (regions: EventArrivalRegion[]) => Promise<void>
}
/**
 * {@link UpcomingEventArrivals} implemented with {@link AsyncStorage}.
 */
export class AsyncStorageUpcomingEventArrivals
implements UpcomingEventArrivals {
  private static KEY = "@upcoming-event-arrivals"

  async all() {
    return await AsyncStorageUtils.parseJSONItem(
      EventArrivalRegionsSchema,
      AsyncStorageUpcomingEventArrivals.KEY
    ).then((arrivals) => arrivals ?? [])
  }

  async replaceAll(regions: EventArrivalRegion[]) {
    await AsyncStorage.setItem(
      AsyncStorageUpcomingEventArrivals.KEY,
      JSON.stringify(regions)
    )
  }
}

/**
 * Given a base {@link UpcomingEventArrivals} instance, it prevents arrivals
 * from being read and written if the user has background location permissions
 * disabled.
 */
export const requireBackgroundLocationPermissions = (
  base: UpcomingEventArrivals,
  loadPermissions: () => Promise<boolean> = async () => {
    return (await getBackgroundPermissionsAsync()).granted
  }
): UpcomingEventArrivals => ({
  all: async () => {
    return (await loadPermissions()) ? await base.all() : []
  },
  replaceAll: async (arrivalRegions) => {
    if (await loadPermissions()) {
      await base.replaceAll(arrivalRegions)
    }
  }
})
