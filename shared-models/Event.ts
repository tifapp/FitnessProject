import { UserHandle } from "@content-parsing"
import { StringDateRangeSchema, StringDateSchema } from "@date-time"
import { ColorStringSchema } from "TiFShared/domain-models/ColorString"
import { z } from "zod"
import { LocationCoordinates2DSchema } from "./Location"
import { PlacemarkSchema } from "./Placemark"
import { TodayOrTomorrowSchema } from "./TodayOrTomorrow"
import {
  BlockedBidirectionalUserRelationsSchema,
  UnblockedBidirectionalUserRelationsSchema
} from "./User"

export type EventID = number

/**
 * A zod schema for {@link EventRegion}.
 */
export const EventRegionSchema = z.object({
  coordinate: LocationCoordinates2DSchema,
  arrivalRadiusMeters: z.number()
})

/**
 * An event region is defined by the precise location coordinate of an event, and its arrival radius.
 */
export type EventRegion = z.infer<typeof EventRegionSchema>

export const UnblockedEventAttendeeSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  handle: UserHandle.zodSchema,
  profileImageURL: z.string().url().nullable(),
  relations: UnblockedBidirectionalUserRelationsSchema
})

/**
 * A zod schema for an event attendee where either the user or host are blocking one another.
 */
export const BlockedEventAttendeeSchema = UnblockedEventAttendeeSchema.omit({
  relations: true
}).extend({ relations: BlockedBidirectionalUserRelationsSchema })

/**
 * User information given for an attendee of an event.
 */
export type EventAttendee = z.infer<typeof UnblockedEventAttendeeSchema>

/**
 * A zod schema for an event attendees list page fetched from the server.
 */
export const EventAttendeesPageSchema = z.object({
  attendees: z.array(UnblockedEventAttendeeSchema),
  totalAttendeeCount: z.number(),
  nextPageCursor: z.string().nullable()
})

export const EventSettingsSchema = z.object({
  shouldHideAfterStartDate: z.boolean(),
  isChatEnabled: z.boolean()
})

/**
 * Specific tunable values that a host can impose on an event.
 */
export type EventSettings = z.infer<typeof EventSettingsSchema>

export const EventUserAttendeeStatusSchema = z.union([
  z.literal("not-participating"),
  z.literal("hosting"),
  z.literal("attending")
])

/**
 * A status for telling whether or not the user is attending, hosting, or not participating in an event.
 */
export type EventUserAttendeeStatus = z.infer<
  typeof EventUserAttendeeStatusSchema
>

export const EventPreviewAttendeeSchema = UnblockedEventAttendeeSchema.pick({
  id: true,
  profileImageURL: true
})

/**
 * Quick and simple information needed to show profile images of an event attendee.
 */
export type EventPreviewAttendee = Pick<EventAttendee, "id" | "profileImageURL">

export const EventLocationSchema = EventRegionSchema.extend({
  isInArrivalTrackingPeriod: z.boolean(),
  timezoneIdentifier: z.string(),
  placemark: PlacemarkSchema.nullable()
})

/**
 * Information for the location of an event.
 *
 * This type includes the properties of an {@link EventRegion}, and
 * additionally adds an optional placemark property which can be undefined if
 * the `coordinate` has not yet been geocoded on the backend.
 *
 * Additionally, since arrival tracking is tied to regions rather than events,
 * `isInArrivalTrackingPeriod` is contained on this type rather than
 * {@link CurrentUserEvent}. Whilst arrival statuses are only displayed within
 * 1 hour of the event starting, `isInArrivalTrackingPeriod` determines whether
 * or not the event is in the 24 hour period where we can add it to
 * {@link EventArrivalsTracker}. The 24 hour period covers the 24 hours prior
 * to the event starting.
 */
export type EventLocation = z.infer<typeof EventLocationSchema>

export const EventTimeResponseSchema = z.object({
  secondsToStart: z.number(),
  todayOrTomorrow: TodayOrTomorrowSchema.nullable(),
  dateRange: StringDateRangeSchema
})

/**
 * Information on the time that an event starts.
 *
 * The goal of this type is to have the server provide as much information about the time upfront
 * since the user's device time can be flakey, or event blatantly incorrect.
 *
 * If `secondsToStart` is negative, then the event is officially underway.
 */
export type EventTimeResponse = z.infer<typeof EventTimeResponseSchema>

export const CurrentUserEventResponseSchema = z.object({
  id: z.number(),
  title: z.string(), // TODO: - Decide max length.
  description: z.string(),
  color: ColorStringSchema,
  attendeeCount: z.number().nonnegative(),
  joinDate: StringDateSchema.nullable(),
  createdAt: StringDateSchema,
  updatedAt: StringDateSchema,
  hasArrived: z.boolean(),
  isChatExpired: z.boolean(),
  userAttendeeStatus: EventUserAttendeeStatusSchema,
  settings: EventSettingsSchema,
  time: EventTimeResponseSchema,
  location: EventLocationSchema,
  previewAttendees: z.array(EventPreviewAttendeeSchema),
  host: UnblockedEventAttendeeSchema,
  endedAt: StringDateSchema.nullable()
})

/**
 * The response type for an event. See {@link CurrentUserEvent} for more properties that
 * don't come directly from the response.
 */
export type CurrentUserEventResponse = z.infer<
  typeof CurrentUserEventResponseSchema
>

/**
 * The main type for representing an event throughout the app.
 *
 * Events contain many properties including, colors, custom settings, and much more.
 *
 * Each event has a single host, and if that host leaves then they must either give up their host
 * status to another attendee, or they must cancel the event. See {@link EventAttendee} for more information.
 *
 * This type also carries the notion of a "preview attendee", which contains just the id and profile
 * image url of a user. There won't be more than a few preview attendee objects in the resulting
 * `previewAttendees` array as the primary purpose is to use them to display a couple of avatar images
 * to make the event more enticing. See {@link EventPreviewAttendee} for more information.
 *
 * Additionally, there should be a noted difference between `hasArrived` and `joinDate`. `hasArrived` is
 * a simple property that tells us that the user is physically present at the event location whereas `joinDate`
 * is the exact date that they pressed the join button through the UI.
 *
 * Every event has the option of getting a specific group chat enabled just for it. This group chat can only
 * last for at least the duration of the event. However, the event's end doesn't mean that the group chat
 * should end immediately, and so `isChatExpired` denotes when the group chat is _actually_ closed.
 *
 * Information denoting the time that the event takes place can be found in the `time` field. The overall
 * philosophy is to have the server respond with the relative time to when the event starts, as the user's
 * device time is flakey and sometimes blatantly wrong. When we receive an event from the server, a timestamp
 * is added to the event that indicates when we received it. This ensures the countdown in the UI is accurate
 * when the user navigates to the details page. See {@link EventTimeResponse} for more information.
 *
 * Hosts are allowed to customize specific properties about the event, such as disabling the group chat.
 * However, one of the main properties that they can choose is `shouldHideEventAfterStartDate` which indicates
 * that the event should be hidden from the map (explore feature) after it's officially underway. See
 * {@link EventSettings} for more information.
 *
 * The `location` of an event contains 2 properties that describe its uniqueness or what we'll call {@link EventRegion},
 * `coordinate` and `arrivalRadiusMeters`. Additionally, it contains 2 more properties needed for other purposes.
 * `placemark` is an optional field of type {@link Placemark}, and it's optional since the server handles geocoding
 * `coordinate` into that field. This geocoding process is flakey, so it may not be around when we need it.
 * `isInArrivalTrackingPeriod` is a simple boolean for describing whether or not we can add the event region to the
 * {@link EventArrivalsTracker} once the user has joined the event. See {@link EventLocation} for more information.
 */
export type CurrentUserEvent = Omit<CurrentUserEventResponse, "time"> & {
  time: CurrentUserEventResponse["time"] & { clientReceivedTime: Date }
}

export const currentUserEventFromResponse = (
  response: CurrentUserEventResponse
) => ({
  ...response,
  time: { ...response.time, clientReceivedTime: new Date() }
})

export const BlockedEventResponseSchema = CurrentUserEventResponseSchema.omit({
  host: true
})
  .pick({
    id: true,
    title: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({ host: BlockedEventAttendeeSchema })

/**
 * The content of an event that the user sees when they are blocked by the host.
 */
export type BlockedEvent = z.infer<typeof BlockedEventResponseSchema>
