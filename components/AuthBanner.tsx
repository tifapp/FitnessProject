import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  LayoutRectangle,
  View
} from "react-native"
import { ButtonProps, PrimaryButton } from "./Buttons"
import { ReactNode, useMemo, useRef, useState } from "react"
import { BodyText, Headline, Title } from "./Text"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  TouchableHighlight
} from "@gorhom/bottom-sheet"
import { useSharedValue } from "react-native-reanimated"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useFontScale } from "@lib/Fonts"
import { AppStyles } from "@lib/AppColorStyle"
import { IoniconCloseButton } from "./common/Icons"

export type AuthBannerProps = {
  onSignInTapped: () => void
  onSignUpTapped: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * A view to display in order to entice the user to create an account.
 */
export const AuthBannerView = ({
  onSignUpTapped,
  onSignInTapped,
  style
}: AuthBannerProps) => (
  <View style={style}>
    <View style={styles.bannerContainer}>
      <Title style={styles.bannerTitle}>Sign Up for Free Today!</Title>
      <BodyText style={styles.bannerDescription}>
        Sign up today to enjoy the latest and greatest fitness fun!
      </BodyText>
      <View style={styles.placeholderIllustration} />
      <PrimaryButton onPress={onSignUpTapped} style={styles.bannerButton}>
        Sign Up for Free
      </PrimaryButton>
      <TouchableHighlight
        activeOpacity={1}
        onPress={onSignInTapped}
        underlayColor={AppStyles.colorOpacity15}
        style={[styles.textButton, { height: 48 * useFontScale() }]}
      >
        <Headline>Sign In</Headline>
      </TouchableHighlight>
    </View>
  </View>
)

export type AuthBannerButtonProps<Children extends ReactNode> = Omit<
  ButtonProps<Children>,
  "onPress"
> &
  AuthBannerProps & { bannerStyle?: StyleProp<ViewStyle>; children: Children }

/**
 * A button which when pressed will display {@link AuthBannerView}.
 */
export const AuthBannerButton = <Children extends ReactNode>({
  bannerStyle,
  onSignInTapped,
  onSignUpTapped,
  ...props
}: AuthBannerButtonProps<Children>) => {
  const sheetRef = useRef<BottomSheetModal>(null)
  const [bannerLayout, setBannerLayout] = useState<LayoutRectangle>()
  const { bottom } = useSafeAreaInsets()
  const paddingForNonSafeAreaScreens = bottom === 0 ? 24 : 0
  const sheetHeight =
    bannerLayout?.height && bannerLayout.height + paddingForNonSafeAreaScreens
  const animatedIndex = useSharedValue(1)
  const closeButtonHitSlop = 24 * useFontScale()
  return (
    <>
      <PrimaryButton {...props} onPress={() => sheetRef.current?.present()} />
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={useMemo(() => [sheetHeight ?? "50%"], [sheetHeight])}
        handleStyle={styles.bottomSheetHandle}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={1}
            animatedIndex={animatedIndex}
          />
        )}
      >
        <SafeAreaView
          edges={["bottom"]}
          onLayout={(e) => setBannerLayout(e.nativeEvent.layout)}
          style={styles.bottomSheetView}
        >
          <View style={styles.bottonSheetTopRow}>
            <View style={styles.bottomSheetTopRowSpacer} />
            <IoniconCloseButton
              size={20}
              hitSlop={{
                top: closeButtonHitSlop,
                left: closeButtonHitSlop,
                right: closeButtonHitSlop,
                bottom: closeButtonHitSlop
              }}
              onPress={() => sheetRef.current?.dismiss()}
            />
          </View>
          <AuthBannerView
            onSignInTapped={() => {
              onSignInTapped()
              sheetRef.current?.dismiss()
            }}
            onSignUpTapped={() => {
              onSignUpTapped()
              sheetRef.current?.dismiss()
            }}
            style={[styles.bottomSheetBannerStyle, bannerStyle]}
          />
        </SafeAreaView>
      </BottomSheetModal>
    </>
  )
}

const styles = StyleSheet.create({
  bannerContainer: {
    rowGap: 16
  },
  bannerTitle: {
    textAlign: "center"
  },
  bannerDescription: {
    textAlign: "center"
  },
  bannerButton: {
    width: "100%"
  },
  bottomSheetBannerStyle: {
    paddingBottom: 24
  },
  bottomSheetHandle: {
    opacity: 0
  },
  bottomSheetView: {
    rowGap: 16,
    paddingHorizontal: 24
  },
  textButton: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  },
  bottonSheetTopRow: {
    display: "flex",
    flexDirection: "row"
  },
  bottomSheetTopRowSpacer: {
    flex: 1
  },
  placeholderIllustration: {
    backgroundColor: "red",
    height: 200
  }
})
