import { LinkingOptions } from "@react-navigation/native";
import { Linking } from "react-native";
import { UserNotifications } from "./UserNotifications";

/**
 * Creates the app's deep linking configuration.
 *
 * @param getAppLaunchURL a function that returns the URL that the app was opened with (defaults to `Linking.getInitialURL`)
 * @param userNotifications a `UserNotifications` instance to handle urls from push notifications
 * @returns
 */
export const makeLinkingConfig = ({
  getAppLaunchURL = Linking.getInitialURL,
  userNotifications,
}: {
  getAppLaunchURL?: () => Promise<string | null>;
  userNotifications: UserNotifications;
}): LinkingOptions => {
  return {
    prefixes: ["tifapp://"],
    config: {
      screens: {
        Feed: {
          screens: {
            Home: "home",
          },
        },
      },
    },
    getInitialURL: async () => {
      const notificationURL = await userNotifications
        .lastNotificationContent()
        .then((content) => content?.data.url as string | undefined);
      if (notificationURL) return notificationURL;
      return await getAppLaunchURL();
    },
  };
};
