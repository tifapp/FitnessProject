import { PrimaryButton } from "@components/Buttons"
import { TiFFooterView } from "@components/Footer"
import { AnimatedPagerView } from "@components/Pager"
import { Headline } from "@components/Text"
import { PlusIconView } from "@components/common/Icons"
import {
  ExploreEventsView,
  createInitialCenter,
  isSignificantlyDifferentRegions,
  useExploreEvents
} from "@explore-events-boundary"
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { colorWithOpacity } from "TiFShared/lib/Color"
import { FontScaleFactors } from "@lib/Fonts"
import { ProfileCircleView } from "@components/profileImageComponents/ProfileCircle"
import { IfAuthenticated } from "@user/Session"
import { AppStyles } from "@lib/AppColorStyle"
import { useRef, useState, useContext } from "react"
import { StyleProp, ViewStyle, View, Pressable, StyleSheet } from "react-native"
import PagerView from "react-native-pager-view"
import { TiFContext } from "./Context"
import { useCoreNavigation } from "@components/Navigation"
import { DEFAULT_EDIT_EVENT_FORM_VALUES } from "@event/EditFormValues"

export type HomeProps = {
  style?: StyleProp<ViewStyle>
}

export const HomeView = ({ style }: HomeProps) => {
  const pagerRef = useRef<PagerView>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const footerBackgroundOpacity = useSharedValue(0)
  return (
    <View style={style}>
      <View style={styles.container}>
        <AnimatedPagerView
          ref={pagerRef}
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
            <ExploreView />
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
          <FooterView
            pageIndex={pageIndex}
            onPageIndexTapped={(index) => pagerRef.current?.setPage(index)}
          />
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

type FooterProps = {
  pageIndex: number
  onPageIndexTapped: (index: number) => void
}

const FooterView = ({ pageIndex, onPageIndexTapped }: FooterProps) => {
  const { presentProfile, presentEditEvent } = useCoreNavigation()
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerItem}>
        <PrimaryButton
          onPress={() => presentEditEvent(DEFAULT_EDIT_EVENT_FORM_VALUES)}
          style={styles.footerCreateEventButton}
          contentStyle={styles.footerCreateEventButtonContent}
        >
          <PlusIconView
            maxmimumFontScaleFactor={FontScaleFactors.xxxLarge}
            size={16}
          />
          <Headline
            maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
            style={styles.footerCreateEventButtonText}
          >
            Event
          </Headline>
        </PrimaryButton>
      </View>
      <View style={[styles.footerItem, styles.footerBreadcrumbs]}>
        <View style={styles.footerBreadcrumbsContainer}>
          <PageDotView
            index={0}
            selectedIndex={pageIndex}
            onTapped={onPageIndexTapped}
          />
          <PageDotView
            index={1}
            selectedIndex={pageIndex}
            onTapped={onPageIndexTapped}
          />
        </View>
      </View>
      <View style={styles.footerItem}>
        <IfAuthenticated
          thenRender={(session) => (
            <Pressable
              onPress={() => presentProfile(session.id)}
              style={styles.footerProfileImageContainer}
            >
              <ProfileCircleView
                name={session.name}
                imageURL={session.profileImageURL}
                maximumFontSizeMultiplier={FontScaleFactors.xxxLarge}
                style={styles.footerProfileImage}
              />
              <View style={styles.footerProfileLineIndicator} />
            </Pressable>
          )}
        />
      </View>
    </View>
  )
}

type PageDotProps = {
  index: number
  selectedIndex: number
  onTapped: (index: number) => void
}

const PageDotView = ({ index, selectedIndex, onTapped }: PageDotProps) => (
  <Pressable
    onPress={() => onTapped(index)}
    hitSlop={{
      top: 16,
      left: index === 0 ? 16 : 0,
      bottom: 16,
      right: index === 1 ? 16 : 0
    }}
  >
    <View
      style={{
        borderRadius: 32,
        width: 8,
        height: 8,
        backgroundColor:
          index === selectedIndex
            ? AppStyles.colorOpacity35
            : AppStyles.colorOpacity15
      }}
    />
  </Pressable>
)

const ExploreView = () => {
  const { fetchEvents } = useContext(TiFContext)!
  const { region, data, updateRegion } = useExploreEvents(
    createInitialCenter(),
    { fetchEvents, isSignificantlyDifferentRegions }
  )
  return (
    <ExploreEventsView
      region={region}
      data={data}
      onRegionUpdated={updateRegion}
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
  footerCreateEventButton: {
    height: 44,
    paddingVertical: 0
  },
  footerCreateEventButtonContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8
  },
  footerCreateEventButtonText: {
    color: "white"
  },
  footerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  footerBreadcrumbsContainer: {
    display: "flex",
    flexDirection: "row",
    columnGap: 8,
    alignSelf: "center"
  },
  footerBreadcrumbs: {
    flex: 1
  },
  footerItem: {
    minWidth: 80
  },
  footerProfileImageContainer: {
    height: 44,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 8,
    alignSelf: "flex-end"
  },
  footerProfileImage: {
    width: 40,
    height: 40
  },
  footerProfileLineIndicator: {
    backgroundColor: AppStyles.primaryColor,
    width: 20,
    height: 2,
    borderRadius: 8,
    marginTop: 4
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
