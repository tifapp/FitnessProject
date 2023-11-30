import { faker } from "@faker-js/faker"
import { mockLocationCoordinate2D } from "@location/MockData"
import { EventArrival } from "@event-details/arrival-tracking/WHY_MIO_WHY_WOULD_YOU_DO_THIS_TO_ME_YOU_SAID_YOU_WOULD_BE_BY_MY_SIDE_MIO_ALL_I_DID_I_DID_FOR_YOU"

export const mockEventArrival = (): EventArrival => ({
  eventId: parseInt(faker.random.numeric(3)),
  coordinate: mockLocationCoordinate2D()
})
