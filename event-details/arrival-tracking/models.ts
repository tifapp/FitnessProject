import { faker } from "@faker-js/faker"
import { StringDateRangeSchema, dateRange } from "@lib/date"
import {
  LocationCoordinates2DSchema,
  mockLocationCoordinate2D
} from "@lib/location"
import { z } from "zod"

/**
 * A zod schema for {@link EventArrivalNotification}.
 */
export const EventArrivalNotificationSchema = z.object({
  eventId: z.number(),
  eventName: z.string().nonempty(),
  coordinate: LocationCoordinates2DSchema,
  dateRange: StringDateRangeSchema
})

/**
 * A zod schema for an array of {@link EventArrivalNotification}.
 */
export const EventArrivalNotificationsSchema = z.array(
  EventArrivalNotificationSchema
)

/**
 * Event arrival notifications are sent when the user enters the area of an event,
 * so that other participants are aware of their arrival.
 *
 * This type is used to store the information neccessary for sending a local notification
 * to the user that they have arrived at the event, and that we have let everyone else know
 * that they are there.
 */
export type EventArrivalNotification = z.infer<
  typeof EventArrivalNotificationSchema
>

export const mockEventArrivalNotification = (): EventArrivalNotification => ({
  eventId: parseInt(faker.random.numeric(3)),
  eventName: faker.word.noun(),
  coordinate: mockLocationCoordinate2D(),
  dateRange: dateRange(faker.date.past(), faker.date.future())
})
