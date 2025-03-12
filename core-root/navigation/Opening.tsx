import { useTiFNavigation } from "@components/Navigation"
import { PragmaQuoteView } from "@edit-event-boundary/PragmaQuotes"
import { StaticScreenProps } from "@react-navigation/native"
import React from "react"
import { View } from "react-native"
import { EventID } from "TiFShared/domain-models/Event"
import { FadingOverlay } from "./FadingOverlay"
import { OverlookWallpaper } from "./Overlook"

export const openingScreenNav = () => ({
  opening: {
    options: { headerShown: false },
    screen: OpeningScreen
  }
})

type OpeningScreenProps = StaticScreenProps<{ id: EventID }>

export const openingQuote = () => EDIT_EVENT_QUOTES.ext.randomElement()

const EDIT_EVENT_QUOTES = [
  // "Your destiny awaits."
  "Look! The fog is clearing up!"
  // "Rise and shine!\nThere's a whole day of exciting possibilities to explore!"
]

const OpeningScreen = ({ route }: OpeningScreenProps) => {
  const navigation = useTiFNavigation()

  const navigateHome = () => navigation.navigate("home")

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <OverlookWallpaper />
      <PragmaQuoteView
        style={{ position: "absolute", bottom: 64, width: "100%" }}
        quote={openingQuote}
        animationInterval={5}
        initialDelay={3000}
      />
      <FadingOverlay color="black" />
    </View>
  )
}
