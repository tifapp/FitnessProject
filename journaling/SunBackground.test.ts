import { dateRange } from "TiFShared/domain-models/FixedDateRange"
import { Sky, Sun, SunBackgroundTime } from "./SunBackground"

describe("SunBackground tests", () => {
  describe("Sun tests", () => {
    it.each([
      { t: 0, y: -0.5 },
      { t: 0.1, y: -0.2048 },
      { t: 0.3, y: -0.0128 },
      { t: 0.5, y: 0 },
      { t: 1, y: -0.5 },
      { t: 0.9, y: -0.2048 },
      { t: 0.7, y: -0.012 }
    ])(
      "should return the correct relative y position ($y) for the time $t",
      ({ t, y }) => {
        expect(Sun.relativeYPosition(t)).toBeCloseTo(y)
      }
    )

    it("should return the correct absolute positioning", () => {
      const yPos = Sun.absoluteYPosition(
        0.3,
        { width: 350, height: 800 },
        { top: 20, bottom: 20, left: 0, right: 0 }
      )
      expect(yPos).toBeCloseTo(76.48)
    })

    it.each([
      { t: 0.02, gradient: "sunrise" },
      { t: 0.0427, gradient: "sunrise" },
      { t: 0.2287, gradient: "midDay" },
      { t: 0.527662, gradient: "midDay" },
      { t: 0.72972, gradient: "midDay" },
      { t: 0.9272, gradient: "midDay" },
      { t: 0.9527862, gradient: "sunset" },
      { t: 0.97487, gradient: "sunset" },
      { t: 1, gradient: "sunset" }
    ] as const)(
      "should return the proper sun gradient ($gradient) for time $t",
      ({
        t,
        gradient
      }: {
        t: SunBackgroundTime
        gradient: keyof typeof Sun.gradients
      }) => {
        const sunriseDate = new Date("2025-02-12T06:30:00")
        const sunsetDate = new Date("2025-02-12T16:30:00")
        expect(
          Sun.gradientAtTime(t, dateRange(sunriseDate, sunsetDate)!)
        ).toEqual(Sun.gradients[gradient])
      }
    )
  })

  describe("Sky tests", () => {
    it.each([
      { t: 0.02, gradient: "sunrise" },
      { t: 0.0427, gradient: "sunrise" },
      { t: 0.2287, gradient: "morning" },
      { t: 0.527662, gradient: "midDay" },
      { t: 0.72972, gradient: "afternoon" },
      { t: 0.9272, gradient: "afternoon" },
      { t: 0.9527862, gradient: "sunset" },
      { t: 0.97487, gradient: "sunset" },
      { t: 1, gradient: "sunset" }
    ] as const)(
      "should return the proper sky gradient ($gradient) for time $t",
      ({
        t,
        gradient
      }: {
        t: SunBackgroundTime
        gradient: keyof typeof Sky.gradients
      }) => {
        const sunriseDate = new Date("2025-02-12T06:30:00")
        const sunsetDate = new Date("2025-02-12T16:30:00")
        expect(
          Sky.gradientAtTime(t, dateRange(sunriseDate, sunsetDate)!)
        ).toEqual(Sky.gradients[gradient])
      }
    )

    it.each([
      { t: 0, m: 0.30875 },
      { t: 0.3, m: 0.0956 },
      { t: 0.4983, m: 0.0956 },
      { t: 0.5, m: 0.0956 },
      { t: 0.51982, m: 0.0956 },
      { t: 1, m: 0.30875 }
    ] as const)(
      "should return the proper sky gradient midpoint ($m) for time $t",
      ({ t, m }: { t: SunBackgroundTime; m: number }) => {
        const mid = Sky.gradientMidPoint(
          t,
          { width: 350, height: 800 },
          { top: 20, bottom: 20, left: 0, right: 0 }
        )
        expect(mid).toBeCloseTo(m)
      }
    )
  })
})
