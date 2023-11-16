/* do not change this file, it is auto generated by storybook. */

import {
  configure,
  addDecorator,
  addParameters,
  addArgsEnhancer,
  clearDecorators,
} from "@storybook/react-native";

global.STORIES = [
  {
    titlePrefix: "",
    directory: "./components",
    files: "**/*.stories.?(ts|tsx|js|jsx)",
    importPathMatcher:
      "^\\.[\\\\/](?:components(?:[\\\\/](?!\\.)(?:(?:(?!(?:^|[\\\\/])\\.).)*?)[\\\\/]|[\\\\/]|$)(?!\\.)(?=.)[^\\\\/]*?\\.stories\\.(?:ts|tsx|js|jsx)?)$",
  },
];

import "@storybook/addon-ondevice-notes/register";
import "@storybook/addon-ondevice-controls/register";
import "@storybook/addon-ondevice-backgrounds/register";
import "@storybook/addon-ondevice-actions/register";

import { argsEnhancers } from "@storybook/addon-actions/dist/modern/preset/addArgs";

import { decorators, parameters } from "./preview";

if (decorators) {
  if (__DEV__) {
    // stops the warning from showing on every HMR
    require("react-native").LogBox.ignoreLogs([
      "`clearDecorators` is deprecated and will be removed in Storybook 7.0",
    ]);
  }
  // workaround for global decorators getting infinitely applied on HMR, see https://github.com/storybookjs/react-native/issues/185
  clearDecorators();
  decorators.forEach((decorator) => addDecorator(decorator));
}

if (parameters) {
  addParameters(parameters);
}

try {
  argsEnhancers.forEach((enhancer) => addArgsEnhancer(enhancer));
} catch {}

const getStories = () => {
  return {
    "./componentsAttendeesListAttendeesList.stories.tsx": require("../components/AttendeesList/AttendeesList.stories.tsx"),
    "./componentsButtonsButtons.stories.tsx": require("../components/Buttons/Buttons.stories.tsx"),
    "./componentsChangePasswordChangePassword.stories.tsx": require("../components/ChangePassword/ChangePassword.stories.tsx"),
    "./componentsContentReportingContentReporting.stories.tsx": require("../components/ContentReporting/ContentReporting.stories.tsx"),
    "./componentsContentTextContextText.stories.tsx": require("../components/ContentText/ContextText.stories.tsx"),
    "./componentsExploreExplore.stories.tsx": require("../components/Explore/Explore.stories.tsx"),
    "./componentsForgotPasswordForgotPasswordForm.stories.tsx": require("../components/ForgotPassword/ForgotPasswordForm.stories.tsx"),
    "./componentsLocationSearchLocationSearch.stories.tsx": require("../components/LocationSearch/LocationSearch.stories.tsx"),
    "./componentsSearchBarSearchBar.stories.tsx": require("../components/SearchBar/SearchBar.stories.tsx"),
    "./componentsSettingsScreenSettingsScreen.stories.tsx": require("../components/SettingsScreen/SettingsScreen.stories.tsx"),
    "./componentsSignInSignIn.stories.tsx": require("../components/SignIn/SignIn.stories.tsx"),
    "./componentsSignUpSignUp.stories.tsx": require("../components/SignUp/SignUp.stories.tsx"),
    "./componentsTextFieldTextField.stories.tsx": require("../components/TextField/TextField.stories.tsx"),
    "./componentsVerificationCodeVerifyCode.stories.tsx": require("../components/VerificationCode/VerifyCode.stories.tsx"),
  };
};

configure(getStories, module, false);
