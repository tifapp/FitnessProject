import { EventResponse } from "TiFShared/api/models/Event"
import { dayjs, now } from "TiFShared/lib/Dayjs"
import { Reassign } from "TiFShared/lib/Types/HelperTypes"

/**
 * Adds a `clientReceivedTime` field to the time object in an event response.
 *
 * This field is used to calculate the time until the event starts in the
 * countdown UI, as the event may be received on the client many minutes
 * before the user actually views the event in any capacity.
 */
export type ClientSideEventTime = EventResponse["time"] & {
  clientReceivedTime: Date
}

/**
 * Returns the amount of seconds before an event starts based off its client received time.
 */
export const eventSecondsToStart = ({
  secondsToStart,
  clientReceivedTime
}: Pick<ClientSideEventTime, "secondsToStart" | "clientReceivedTime">) => {
  const offset = now().diff(dayjs(clientReceivedTime))
  return secondsToStart - Math.round(offset / 1000)
}

/**
 * Whether or not the time of an event has indicated that it has started.
 */
export const hasEventTimeStarted = (
  time: Pick<ClientSideEventTime, "secondsToStart" | "clientReceivedTime">
) => {
  return eventSecondsToStart(time) <= 0
}

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
 * Additionally, there should be a noted difference between `hasArrived` and `joinedDateTime`. `hasArrived` is
 * a simple property that tells us that the user is physically present at the event location whereas `joinedDateTime`
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
export type ClientSideEvent = Reassign<
  EventResponse,
  "time",
  ClientSideEventTime
>

/**
 * Adds the client received time to an {@link EventResponse}.
 */
export const clientSideEventFromResponse = (response: EventResponse) => ({
  ...response,
  time: { ...response.time, clientReceivedTime: new Date() }
})

/**
 * Returns true for whether or not this event has ended.
 */
export const hasEventEnded = (e: ClientSideEvent) => {
  if (e.endedDateTime) return true
  return -eventSecondsToStart(e.time) >= e.time.dateRange.diff.seconds
}

/**
 * Returns true if an event is ongoing.
 */
export const isEventOngoing = (e: ClientSideEvent) => {
  return hasEventTimeStarted(e.time) && !hasEventEnded(e)
}

/**
 * Returns true if an event has the possibility of starting in the future.
 */
export const canEventStartInTheFuture = (e: ClientSideEvent) => {
  return !hasEventTimeStarted(e.time) && !hasEventEnded(e)
}
