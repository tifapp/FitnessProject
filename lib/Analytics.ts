import { Analytics } from "aws-amplify"
import { createDependencyKey } from "./dependencies"

/**
 * A function type to record analytic events.
 */
export type RecordAnalytics = (
  eventName: string,
  data?: Record<string, string | number>
) => void

/**
 * Records an event to aws amplify analytics.
 *
 * Additional data can optionally be added to events. Amplify records
 * string value data as attributes, and numeric data as metrics. For more
 * information, see:
 *
 * https://docs.amplify.aws/lib/analytics/record/q/platform/js/
 *
 * @param eventName the name of the event.
 * @param data a record of string keys to string or numeric values.
 */
export const amplifyRecordAnalytics = (
  eventName: string,
  data?: Record<string, string | number>
) => {
  Analytics.record({
    name: eventName,
    attributes: compactMapAnaylticsData(data ?? {}, (value) => {
      if (typeof value === "string") return value
      return null
    }),
    metrics: compactMapAnaylticsData(data ?? {}, (value) => {
      if (typeof value === "number") return value
      return null
    })
  })
}

const compactMapAnaylticsData = <V>(
  object: Record<string, string | number>,
  mapper: (value: string | number) => V | null
) => {
  const map = new Map<string, V>()
  Object.entries(object).forEach(([key, value]) => {
    const mapped = mapper(value)
    if (mapped) map.set(key, mapped)
  })
  return Object.fromEntries(map)
}

/**
 * A `DependencyKey` for recording analytics.
 *
 * The default value is a function that records the analytics to AWS Amplify.
 *
 * Additional data can be added on to analytics events, the default value
 * of this key encodes string data as "attributes" and numeric values as
 * "metrics" in AWS terms. For more information see:
 *
 * https://docs.amplify.aws/lib/analytics/record/q/platform/js/
 *
 * It can be used as such inside react components/hooks:
 *
 * ```tsx
 * const Component = () => {
 *    const analytics = useDependencyValue(analyticsDependencyKey)
 *
 *    const doThing = () => {
 *        // The default value will encode "message" as an AWS attribute and
 *        // "count" as an AWS metric.
 *        analytics("thingHappened", { message: "hello", count: 5 })
 *    }
 *
 *    return <Button label="Do Thing" onPress={doThing} />
 * }
 * ```
 */
export const analyticsDependencyKey = createDependencyKey<RecordAnalytics>(
  amplifyRecordAnalytics
)
