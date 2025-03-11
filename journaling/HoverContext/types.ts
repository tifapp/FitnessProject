import { SharedValue } from "react-native-reanimated"

export type Point = {
  x: number
  y: number
}

export type Measurements = {
  x: number
  y: number
  width: number
  height: number
}

export type Target = {
  id: string
  measurements: SharedValue<Measurements>
}
