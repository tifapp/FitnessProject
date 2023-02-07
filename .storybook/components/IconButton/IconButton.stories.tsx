import { ComponentMeta, ComponentStory } from "@storybook/react-native";
import React from "react";
import IconButton from "../../../components/common/IconButton";

const IconButtonMeta: ComponentMeta<typeof IconButton> = {
  title: "IconButton",
  component: IconButton,
  argTypes: {
    onPress: { action: "pressed the button" },
  },
  args: {
    iconName: "10mp",
    onPress: () => {},
    label: "Label",
  },
};

export default IconButtonMeta;

type IconButtonStory = ComponentStory<typeof IconButton>;

export const Basic: IconButtonStory = (args) => <IconButton {...args} />;
export const Color: IconButtonStory = (args) => <IconButton {...args} color="red" />;
export const Reverse: IconButtonStory = (args) => <IconButton {...args} isLabelFirst={true} />;
