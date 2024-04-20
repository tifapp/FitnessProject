import { ForegroundEventRegionMonitor } from "./ForegroundRegionMonitor"

export const advanceByForegroundMonitorBufferTime = (
  multiplier: number = 1
) => {
  jest.advanceTimersByTime(
    ForegroundEventRegionMonitor.BUFFER_TIME * multiplier
  )
}
