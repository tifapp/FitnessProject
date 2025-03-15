import { createContext, useContext } from "react"
import { SharedValue } from "react-native-reanimated"

// Create context for sharing scroll position
export const ScrollContext = createContext<{
  scrollY: SharedValue<number> | null
}>({
  scrollY: null
})

export const useScrollContext = () => useContext(ScrollContext)
