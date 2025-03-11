export type Digit = string

export interface FlipClockCountdownTimeDelta {
  total: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface FlipClockCountdownUnitTimeFormatted {
  current: Digit[]
  next: Digit[]
}

export interface FlipClockCountdownTimeDeltaFormatted {
  days: FlipClockCountdownUnitTimeFormatted
  hours: FlipClockCountdownUnitTimeFormatted
  minutes: FlipClockCountdownUnitTimeFormatted
  seconds: FlipClockCountdownUnitTimeFormatted
}

export interface FlipClockCountdownState {
  timeDelta: FlipClockCountdownTimeDelta
  completed: boolean
}

export interface FlipClockCountdownProps {
  to: Date | number | string
  onComplete?: () => void
  onTick?: (state: FlipClockCountdownState) => void
  showLabels?: boolean
  showSeparators?: boolean
  labels?: string[]
  duration?: number
  renderMap?: boolean[]
  hideOnComplete?: boolean
  stopOnInactiveApp?: boolean
  digitBlockStyle?: any
  labelStyle?: any
  separatorStyle?: any
  dividerStyle?: any
  style?: any
  spacing?: {
    clock?: number
    digitBlock?: number
  }
}

export interface FlipClockDigitProps {
  current: Digit
  next: Digit
  style?: any
  digitStyle?: any
  duration?: number
}
