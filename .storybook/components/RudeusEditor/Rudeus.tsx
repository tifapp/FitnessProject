import { StyleProp, ViewStyle, View, StyleSheet } from "react-native"
import { RudeusPattern, RudeusUser } from "./Models"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import React from "react"
import { useQuery } from "@tanstack/react-query"
import { ActivityIndicator } from "react-native"
import {
  NavigationContainer,
  RouteProp,
  useRoute
} from "@react-navigation/native"
import { StackScreenProps, createStackNavigator } from "@react-navigation/stack"
import {
  BASE_HEADER_SCREEN_OPTIONS,
  ChevronBackButton
} from "@components/Navigation"
import { Headline } from "@components/Text"
import { RudeusPatternsHeaderView, RudeusPatternsView } from "./Patterns"
import { RudeusRegisterView, registerUser, useRudeusRegister } from "./Register"
import {
  DEFAULT_PATTERN_EDITOR_PATTERN,
  RudeusPatternEditorPattern,
  RudeusPatternEditorView,
  editorPattern,
  sharePattern,
  useRudeusPatternEditor
} from "./PatternEditor"
import { SharedRudeusAPI } from "./RudeusAPI"
import { RudeusUserStorage } from "./UserStorage"

type RudeusParamsList = {
  register: undefined
  patterns: RudeusUser
  editor: RudeusPatternEditorPattern
}

const Stack = createStackNavigator<RudeusParamsList>()

export type RudeusProps = {
  user: () => Promise<RudeusUser | null>
  style?: StyleProp<ViewStyle>
}

export const RudeusView = ({ user, style }: RudeusProps) => (
  <TiFQueryClientProvider>
    <SafeAreaProvider>
      <View style={style}>
        <RudeusRouterView user={user} style={style} />
      </View>
    </SafeAreaProvider>
  </TiFQueryClientProvider>
)

const RudeusRouterView = ({ user, style }: RudeusProps) => {
  const query = useQuery(["rudeus-user"], user)
  return (
    <View style={style}>
      {query.isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      )}
      {query.isError && (
        <View style={styles.loadingContainer}>
          <Headline>An Error Occurred</Headline>
        </View>
      )}
      {query.data !== undefined && (
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={query.data !== null ? "patterns" : "register"}
            screenOptions={BASE_HEADER_SCREEN_OPTIONS}
          >
            <Stack.Screen
              name="register"
              options={{ headerTitle: "" }}
              component={RegisterSceen}
            />
            <Stack.Screen
              name="patterns"
              options={{
                headerTitle: "Patterns",
                headerRight: () => (
                  <RudeusPatternsHeaderView
                    username={
                      useRoute<RouteProp<RudeusParamsList, "patterns">>().params
                        ?.name ?? "Unknown"
                    }
                    style={styles.userHeader}
                  />
                )
              }}
              initialParams={query.data !== null ? query.data : undefined}
              component={PatternsScreen}
            />
            <Stack.Screen
              name="editor"
              options={{
                headerTitle: "Edit Pattern",
                headerLeft: ChevronBackButton
              }}
              component={EditorScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </View>
  )
}

const RegisterSceen = ({
  navigation
}: StackScreenProps<RudeusParamsList, "register">) => {
  const state = useRudeusRegister({
    register: async (name) => {
      return await registerUser(name, SharedRudeusAPI, RudeusUserStorage.shared)
    },
    onSuccess: (user) => navigation.replace("patterns", user)
  })
  return <RudeusRegisterView state={state} style={styles.screen} />
}

const PatternsScreen = ({
  navigation
}: StackScreenProps<RudeusParamsList, "patterns">) => (
  <RudeusPatternsView
    patterns={async () => (await SharedRudeusAPI.patterns()).data.patterns}
    onCreatePatternTapped={() => {
      navigation.navigate("editor", DEFAULT_PATTERN_EDITOR_PATTERN)
    }}
    onPatternTapped={(p) => navigation.navigate("editor", editorPattern(p))}
    style={styles.screen}
  />
)

const EditorScreen = ({
  route
}: StackScreenProps<RudeusParamsList, "editor">) => (
  <RudeusPatternEditorView
    state={useRudeusPatternEditor(route.params, {
      share: async (pattern) => await sharePattern(pattern, SharedRudeusAPI)
    })}
    style={styles.screen}
  />
)

const styles = StyleSheet.create({
  loadingContainer: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  screen: { height: "100%", flex: 1 },
  userHeader: { paddingRight: 24 }
})
