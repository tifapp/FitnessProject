import { faker } from "@faker-js/faker"
import { mockLocationCoordinate2D } from "@location/MockData"
import { EventArrival } from "./Models"
import { randomBool, randomFloatInRange } from "@lib/utils/Random"
import { ArrayUtils } from "@lib/utils/Array"
import { EventArrivalRegion } from "@shared-models/EventArrivals"
import { EventArrivalGeofencedRegion } from "./geofencing"
import { EventRegion } from "@shared-models/Event"
import { repeatElements } from "TiFShared/lib/Array"

export const mockEventArrivalGeofencedRegion =
  (): EventArrivalGeofencedRegion => ({
    ...mockEventRegion(),
    isArrived: randomBool()
  })

export const mockEventArrival = (): EventArrival => ({
  eventId: parseInt(faker.random.numeric(5)),
  ...mockEventArrivalGeofencedRegion()
})

export const mockEventArrivalRegion = (): EventArrivalRegion => ({
  eventIds: repeatElements(Math.ceil(randomFloatInRange(1, 5)), () =>
    parseInt(faker.random.numeric(5))
  ),
  ...mockEventArrivalGeofencedRegion()
})

export const mockEventRegion = (): EventRegion => ({
  coordinate: mockLocationCoordinate2D(),
  arrivalRadiusMeters: randomFloatInRange(50, 200)
})
