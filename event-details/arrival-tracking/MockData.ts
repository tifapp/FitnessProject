import { faker } from "@faker-js/faker"
import { mockLocationCoordinate2D } from "@location/MockData"
import { EventArrival } from "@event-details/arrival-tracking/Models"

export const mockEventArrival = (): EventArrival => ({
  eventId: parseInt(faker.random.numeric(3)),
  coordinate: mockLocationCoordinate2D()
})
