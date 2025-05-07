import { StoryMeta } from ".storybook/HelperTypes"
import { ExpandableMapSnippetView } from "@components/MapSnippetView"
import { Headline } from "@components/Text"
import { TiFFormScrollView } from "@components/form-components/ScrollView"
import { XEROX_ALTO_DEFAULT_REGION } from "@explore-events-boundary"
import { PortalProvider } from "@gorhom/portal"
import React, { useState } from "react"
import { View } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

export const MapSnippetMeta: StoryMeta = {
  title: "MapSnippet"
}

export default MapSnippetMeta

export const Basic = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <SafeAreaProvider>
      <PortalProvider>
        <SafeAreaView>
          <TiFFormScrollView>
            <View style={{ height: 64 }} />
            <Headline>Hello World</Headline>
            <ExpandableMapSnippetView
              isExpanded={isExpanded}
              onExpansionChanged={setIsExpanded}
              region={XEROX_ALTO_DEFAULT_REGION}
            />
            <Headline>Hello World</Headline>
          </TiFFormScrollView>
        </SafeAreaView>
      </PortalProvider>
    </SafeAreaProvider>
  )
}
