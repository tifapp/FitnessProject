import { TiFFooterView } from "@components/Footer"
import { Headline } from "@components/Text"
import { AppStyles } from "@lib/AppColorStyle"
import { useContext, useState } from "react"
import { StyleProp, ViewStyle, View, StyleSheet } from "react-native"
import PagerView from "react-native-pager-view"
import { TiFContext } from "./Context"
import {
  ExploreEventsView,
  createInitialCenter,
  isSignificantlyDifferentRegions,
  useExploreEvents
} from "@explore-events-boundary"
import { ClientSideEvent } from "@event/ClientSideEvent"
import { AnimatedPagerView } from "@components/Pager"
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { colorWithOpacity } from "TiFShared/lib/Color"

export type HomeProps = {
  onViewEventTapped: (event: ClientSideEvent) => void
  style?: StyleProp<ViewStyle>
}

export const HomeView = ({ onViewEventTapped, style }: HomeProps) => {
  const [pageIndex, setPageIndex] = useState(0)
  const footerBackgroundOpacity = useSharedValue(0)
  return (
    <View style={style}>
      <View style={styles.container}>
        <AnimatedPagerView
          orientation="horizontal"
          layoutDirection="ltr"
          initialPage={pageIndex}
          onPageSelected={(e) => setPageIndex(e.nativeEvent.position)}
          onPageScroll={(e) => {
            if (e.nativeEvent.position > 0) {
              footerBackgroundOpacity.value = 1
            } else {
              footerBackgroundOpacity.value = e.nativeEvent.offset
            }
          }}
          style={styles.pager}
        >
          <View key="1" style={styles.screen}>
            <TODO />
          </View>
          <View key="2" style={styles.screen}>
            <ExploreView onViewEventTapped={onViewEventTapped} />
          </View>
        </AnimatedPagerView>
        <TiFFooterView
          backgroundStyle={useAnimatedStyle(() => ({
            backgroundColor: colorWithOpacity(
              AppStyles.cardColor,
              footerBackgroundOpacity.value
            )
          }))}
          style={styles.footer}
        >
          <Headline>TODO</Headline>
        </TiFFooterView>
      </View>
    </View>
  )
}

const TODO = () => (
  <View style={styles.todo}>
    <Headline>TODO: - Journey Screen</Headline>
  </View>
)

type ExploreProps = {
  onViewEventTapped: (event: ClientSideEvent) => void
}

const ExploreView = ({ onViewEventTapped }: ExploreProps) => {
  const { fetchEvents } = useContext(TiFContext)!
  const { region, data, updateRegion } = useExploreEvents(
    createInitialCenter(),
    {
      fetchEvents,
      isSignificantlyDifferentRegions
    }
  )
  return (
    <ExploreEventsView
      region={region}
      data={data}
      onRegionUpdated={updateRegion}
      onEventTapped={onViewEventTapped}
      onMapLongPress={console.log}
      onSearchTapped={() => console.log("TODO")}
      style={styles.exploreEvents}
    />
  )
}

const styles = StyleSheet.create({
  todo: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    position: "relative",
    height: "100%",
    flex: 1
  },
  footer: {
    position: "absolute",
    width: "100%",
    flex: 1,
    backgroundColor: "transparent",
    bottom: 0
  },
  pager: {
    flex: 1
  },
  screen: {
    flex: 1
  },
  exploreEvents: {
    flex: 1
  }
})
