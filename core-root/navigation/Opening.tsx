import { useTiFNavigation } from "@components/Navigation"
import { PragmaQuoteView } from "@edit-event-boundary/PragmaQuotes"
import { SidewaysWallpaperDramaticMemo } from "@edit-event-boundary/SidewaysWallpaperDramatic"
import { StaticScreenProps } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { EventID } from "TiFShared/domain-models/Event"

export const openingScreenNav = () => ({
  opening: {
    options: { headerShown: false },
    screen: OpeningScreen
  }
})

type OpeningScreenProps = StaticScreenProps<{ id: EventID }>

export const openingQuote = () => EDIT_EVENT_QUOTES.ext.randomElement()

const EDIT_EVENT_QUOTES = [
  // "Hey!\nWatch it, punk!"
  "The north star guides your path."
]

const OpeningScreen = ({ route }: OpeningScreenProps) => {
  const navigation = useTiFNavigation()
  const [showQuote, setShowQuote] = useState(false)

  useEffect(() => {
    // Set a timeout to show the quote after 3 seconds (3000ms)
    const timer = setTimeout(() => {
      setShowQuote(true)
    }, 15000)

    // Clean up the timer when component unmounts
    return () => clearTimeout(timer)
  }, [])

  const navigateHome = () => navigation.navigate("home")

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* <FogOverlookWallpaper /> */}
      {/* <SidewaysWallpaper /> */}
      {/* <CartographicBackground /> */}
{/*
      <View style={{ position: "absolute", width: "100%", top: 64, left: "0%" }}>
        <GratitudeList />
      </View> */}

      {/* <DialogueOverlookWallpaper /> */}

      {/* <SidewaysWallpaper /> */}

      <SidewaysWallpaperDramaticMemo/>

      {showQuote && (
        <PragmaQuoteView
          style={{ position: "absolute", bottom: 64, width: "100%" }}
          quote={openingQuote}
          animationInterval={25}
          initialDelay={300}
        />
      )}

      {/* <View style={{ position: "absolute", height: "100%", width: "100%", backgroundColor: "orange", opacity: 0.15 }} /> */}
      {/* <FadingOverlay color="white" /> */}
    </View>
  )
}
