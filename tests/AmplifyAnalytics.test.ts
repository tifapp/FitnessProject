import { Analytics } from "aws-amplify"
import { AnalyticsEvent } from "@aws-amplify/analytics/lib-esm/types"
import { amplifyRecordAnalytics } from "@lib/Analytics"

jest.mock("aws-amplify")

let recordedEvent: AnalyticsEvent | undefined

Analytics.record = jest
  .fn()
  .mockImplementation((event) => (recordedEvent = event))

const testAnalyticEventName = "test"
const testAnalyticAttribute = "test_attribute"
const testAnalyticMetric = 5

describe("AmplifyAnalytics tests", () => {
  it("converts an event with no data payload correctly", () => {
    amplifyRecordAnalytics(testAnalyticEventName)
    expect(recordedEvent).toMatchObject({ name: testAnalyticEventName })
  })

  it("converts an event with only numeric data to amplify analytics metrics", () => {
    const eventData = { testMetric: testAnalyticMetric }
    amplifyRecordAnalytics(testAnalyticEventName, eventData)
    expect(recordedEvent).toMatchObject({
      name: testAnalyticEventName,
      metrics: { testMetric: testAnalyticMetric }
    })
  })

  it("converts an event with only string value data to amplify analytics attributes", () => {
    const eventData = { testAttribute: testAnalyticAttribute }
    amplifyRecordAnalytics(testAnalyticEventName, eventData)
    expect(recordedEvent).toMatchObject({
      name: testAnalyticEventName,
      attributes: { testAttribute: testAnalyticAttribute }
    })
  })

  it("converts event with attribute and metric data to proper amplify analytics event", () => {
    const eventData = {
      testAttribute: testAnalyticAttribute,
      testMetric: testAnalyticMetric
    }
    amplifyRecordAnalytics(testAnalyticEventName, eventData)
    expect(recordedEvent).toMatchObject({
      name: testAnalyticEventName,
      attributes: { testAttribute: testAnalyticAttribute },
      metrics: { testMetric: testAnalyticMetric }
    })
  })
})
