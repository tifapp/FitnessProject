import { faker } from "@faker-js/faker"
import { mockLocationCoordinate2D } from "@location/MockData"
import { EventArrival } from "./Models"
import { randomBool, randomFloatInRange } from "@lib/utils/Random"

import { EventArrivalGeofencedRegion } from "./geofencing"
import { repeatElements } from "TiFShared/lib/Array"
import { EventArrivalRegion, EventRegion } from "TiFShared/domain-models/Event"

export const mockEventArrivalGeofencedRegion =
  (): EventArrivalGeofencedRegion => ({
    ...mockEventRegion(),
    hasArrived: randomBool()
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
