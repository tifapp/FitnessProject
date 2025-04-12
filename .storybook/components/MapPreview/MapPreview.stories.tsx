import { MapPreview } from "@components/MapPreview"
import { Headline, Title } from "@components/Text"
import { TiFScrollView } from "@components/common/ScrollView"
import { XEROX_ALTO_DEFAULT_REGION } from "@explore-events-boundary"
import { faker } from "@faker-js/faker"
import { PortalProvider } from "@gorhom/portal"
import React, { useState } from "react"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { StoryMeta } from "storybook/HelperTypes"

export const MapPreviewMeta: StoryMeta = {
  title: "MapPreview"
}

export default MapPreviewMeta

const firstContent = faker.lorem.paragraph(8)
const secondContent = faker.lorem.paragraph(15)

export const Basic = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  return (
    <SafeAreaProvider>
      <PortalProvider>
        <SafeAreaView>
          <TiFScrollView>
            <Title>Map Snippet Demo</Title>
            <Headline>{firstContent}</Headline>
            <MapPreview
              isExpanded={isExpanded}
              onExpansionChanged={setIsExpanded}
              region={XEROX_ALTO_DEFAULT_REGION}
            />
            <Headline>{secondContent}</Headline>
          </TiFScrollView>
        </SafeAreaView>
      </PortalProvider>
    </SafeAreaProvider>
  )
}
