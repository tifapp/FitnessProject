import { faker } from "@faker-js/faker"
import { mockLocationCoordinate2D } from "@location/MockData"
import { EventArrival } from "./Models"
import { randomBool, randomFloatInRange } from "@lib/utils/Random"
import { ArrayUtils } from "@lib/utils/Array"
import { EventArrivalRegion } from "@shared-models/EventArrivals"
import { EventArrivalGeofencedRegion } from "./Geofencing"
import { EventRegion } from "@shared-models/Event"

export const mockEventRegion = (): EventRegion => ({
  coordinate: mockLocationCoordinate2D(),
  arrivalRadiusMeters: randomFloatInRange(50, 200)
})

export const mockEventArrivalGeofencedRegion =
  (): EventArrivalGeofencedRegion => ({
    ...mockEventRegion(),
    isArrived: randomBool()
  })

export const mockEventArrival = (): EventArrival => ({
  eventId: parseInt(faker.random.numeric(3)),
  ...mockEventArrivalGeofencedRegion()
})

export const mockEventArrivalRegion = (): EventArrivalRegion => ({
  eventIds: ArrayUtils.repeatElements(Math.ceil(randomFloatInRange(1, 5)), () =>
    parseInt(faker.random.numeric(3))
  ),
  ...mockEventArrivalGeofencedRegion()
})
