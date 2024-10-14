import { useRef } from "react"

export const useConst = <T>(value: T) => {
  return useRef(value).current
}
