import { SecondaryOutlinedButton, PrimaryButton } from "@components/Buttons"
import { CircularIonicon } from "@components/common/Icons"
import { EventColors } from "@event-details/Event"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"
import { View } from "react-native"

const ButtonsMeta: ComponentMeta<typeof View> = {
  title: "Buttons"
}

export default ButtonsMeta

type ButtonsStory = ComponentStory<typeof View>

export const Basic: ButtonsStory = () => (
  <View
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flex: 1
    }}
  >
    <PrimaryButton>
      <CircularIonicon name="airplane" backgroundColor={EventColors.Orange} />
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
      style={{ width: "100%", backgroundColor: EventColors.Orange }}
    />
    <View style={{ marginVertical: 16 }} />
    <SecondaryOutlinedButton>Hello World</SecondaryOutlinedButton>
    <View style={{ marginVertical: 16 }} />
    <SecondaryOutlinedButton disabled>
      Disabled Outlined
    </SecondaryOutlinedButton>
  </View>
)
