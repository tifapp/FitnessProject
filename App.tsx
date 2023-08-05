import { TiFMenuProvider } from "@components/TiFMenuProvider"
import { TiFQueryClientProvider } from "@components/TiFQueryClientProvider"
import { useAppFonts } from "@hooks/Fonts"
import { UserLocationFunctionsProvider } from "@hooks/UserLocation"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { TabNavigation } from "@stacks/ActivitiesStack"
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync
} from "expo-location"
import React from "react"
import { RootSiblingParent } from "react-native-root-siblings"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { withAuthenticator } from "aws-amplify-react-native"

import { Geo } from "@aws-amplify/geo"
import ConfirmSignIn from "@components/loginComponents/ConfirmSignIn"
import ConfirmSignUp from "@components/loginComponents/ConfirmSignUp"
import ForgotPassword from "@components/loginComponents/ForgotPassword"
import Greetings from "@components/loginComponents/Greetings"
import RequireNewPassword from "@components/loginComponents/RequireNewPassword"
import SignIn from "@components/loginComponents/SignIn"
import SignUp from "@components/loginComponents/SignUp"
import VerifyContact from "@components/loginComponents/VerifyContact"
import { Auth } from "aws-amplify"
import awsconfig from "./src/aws-exports"
Geo.configure(awsconfig)
Auth.configure(awsconfig)

const Stack = createStackNavigator()

export type AppProps = {
  isFontsLoaded: boolean
}

const AppView = ({ isFontsLoaded }: AppProps) => {
  if (!isFontsLoaded) return null // TODO: - Splash Screen?
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Activities Screen"
          component={TabNavigation}
          options={{
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const App = () => {
  Geo.searchByText("Amazon Go Store")
    .then((res) => console.log(JSON.stringify(res)))
    .finally(() => {
      ;(async () => {
        const a = await Auth.currentUserCredentials()
        console.log(a)
      })()
    })
  const [isFontsLoaded] = useAppFonts()
  return (
    <TiFQueryClientProvider>
      <UserLocationFunctionsProvider
        getCurrentLocation={getCurrentPositionAsync}
        requestForegroundPermissions={requestForegroundPermissionsAsync}
      >
        <SafeAreaProvider>
          <TiFMenuProvider>
            <RootSiblingParent>
              <AppView isFontsLoaded={isFontsLoaded} />
            </RootSiblingParent>
          </TiFMenuProvider>
        </SafeAreaProvider>
      </UserLocationFunctionsProvider>
    </TiFQueryClientProvider>
  )
}

// export default App

export default withAuthenticator(App, false, [
  <Greetings />,
  <SignIn />,
  <SignUp />,
  <ConfirmSignIn />,
  <ConfirmSignUp />,
  <VerifyContact />,
  <ForgotPassword />,
  <RequireNewPassword />
])
