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
  BottomSheetView,
  TouchableHighlight
} from "@gorhom/bottom-sheet"
import { useSharedValue } from "react-native-reanimated"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useFontScale } from "@lib/Fonts"
import { AppStyles } from "@lib/AppColorStyle"
import { IoniconCloseButton } from "./common/Icons"
import { TiFBottomSheet } from "./BottomSheet"

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
  const [isShowingSheet, setIsShowingSheet] = useState(false)
  const closeButtonHitSlop = 24 * useFontScale()
  return (
    <>
      <PrimaryButton {...props} onPress={() => setIsShowingSheet(true)} />
      <TiFBottomSheet
        isPresented={isShowingSheet}
        handleStyle="hidden"
        sizing="content-size"
        onDismiss={() => setIsShowingSheet(false)}
      >
        <BottomSheetView>
          <SafeAreaView edges={["bottom"]} style={styles.bottomSheetView}>
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
                onPress={() => setIsShowingSheet(false)}
              />
            </View>
            <AuthBannerView
              onSignInTapped={() => {
                onSignInTapped()
                setIsShowingSheet(false)
              }}
              onSignUpTapped={() => {
                onSignUpTapped()
                setIsShowingSheet(false)
              }}
              style={[styles.bottomSheetBannerStyle, bannerStyle]}
            />
          </SafeAreaView>
        </BottomSheetView>
      </TiFBottomSheet>
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
