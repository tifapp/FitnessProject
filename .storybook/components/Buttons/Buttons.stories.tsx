import { AuthBannerButton } from "@components/AuthBanner"
import { TiFBottomSheetProvider } from "@components/BottomSheet"
import { PrimaryButton, SecondaryOutlinedButton } from "@components/Buttons"
import { CircularIonicon } from "@components/common/Icons"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { AppStyles } from "@lib/AppColorStyle"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { ScrollView, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

const ButtonsMeta: ComponentMeta<typeof View> = {
  title: "Buttons"
}

export default ButtonsMeta

type ButtonsStory = ComponentStory<typeof View>

export const Basic: ButtonsStory = () => (
  <SafeAreaProvider>
    <GestureHandlerRootView>
      <TiFBottomSheetProvider>
        <ScrollView style={{ height: "100%" }}>
          <PrimaryButton>
            <CircularIonicon
              size={24}
              name="airplane"
              backgroundColor={AppStyles.orange.toString()}
            />
          </PrimaryButton>
          <View style={{ marginVertical: 16 }} />
          <PrimaryButton>Hello World</PrimaryButton>
          <View style={{ marginVertical: 16 }} />
          <PrimaryButton title="Hello World with title prop" />
          <View style={{ marginVertical: 16 }} />
          <PrimaryButton title="Disabled" disabled />
          <View style={{ marginVertical: 16 }} />
          <PrimaryButton
            title="Max Width"
            style={{
              width: "100%",
              backgroundColor: AppStyles.orange.toString()
            }}
          />
          <View style={{ marginVertical: 16 }} />
          <SecondaryOutlinedButton>Hello World</SecondaryOutlinedButton>
          <View style={{ marginVertical: 16 }} />
          <SecondaryOutlinedButton disabled>
            Disabled Outlined
          </SecondaryOutlinedButton>

          <View style={{ marginVertical: 16 }} />
          <AuthBannerButton
            onSignInTapped={() => console.log("Sign In")}
            onSignUpTapped={() => console.log("Sign Up")}
          >
            Auth Banner
          </AuthBannerButton>
        </ScrollView>
      </TiFBottomSheetProvider>
    </GestureHandlerRootView>
  </SafeAreaProvider>
)
