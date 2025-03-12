import { useTiFNavigation } from "@components/Navigation"
import { PragmaQuoteView } from "@edit-event-boundary/PragmaQuotes"
import { StaticScreenProps } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { EventID } from "TiFShared/domain-models/Event"
import { FadingOverlay } from "./FadingOverlay"
import { FogOverlookWallpaper } from "./FogOverlook"

export const openingScreenNav = () => ({
  opening: {
    options: { headerShown: false },
    screen: OpeningScreen
  }
})

type OpeningScreenProps = StaticScreenProps<{ id: EventID }>

export const openingQuote = () => EDIT_EVENT_QUOTES.ext.randomElement()

const EDIT_EVENT_QUOTES = [
  "Look! The fog is clearing up!!!"
]

const OpeningScreen = ({ route }: OpeningScreenProps) => {
  const navigation = useTiFNavigation()
  const [showQuote, setShowQuote] = useState(false)

  useEffect(() => {
    // Set a timeout to show the quote after 3 seconds (3000ms)
    const timer = setTimeout(() => {
      setShowQuote(true)
    }, 3000)

    // Clean up the timer when component unmounts
    return () => clearTimeout(timer)
  }, [])

  const navigateHome = () => navigation.navigate("home")

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <FogOverlookWallpaper />

      {showQuote && (
        <PragmaQuoteView
          style={{ position: "absolute", bottom: 64, width: "100%" }}
          quote={openingQuote}
          animationInterval={25}
          initialDelay={300}
        />
      )}

      {/* <View style={{ position: "absolute", height: "100%", width: "100%", backgroundColor: "orange", opacity: 0.15 }} /> */}
      <FadingOverlay color="white" />
    </View>
  )
}
