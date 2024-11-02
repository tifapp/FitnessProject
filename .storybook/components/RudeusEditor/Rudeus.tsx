import { StyleProp, ViewStyle, View, StyleSheet } from "react-native"
import { RudeusEditorPattern, RudeusPattern, RudeusUser } from "./Models"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TiFQueryClientProvider } from "@lib/ReactQuery"
import React, { createContext, useContext } from "react"
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
import { RudeusRegisterView, useRudeusRegister } from "./Register"
import {
  EMPTY_PATTERN_EDITOR_PATTERN,
  RudeusPatternEditorView,
  editorPattern,
  useRudeusPatternEditor
} from "./PatternEditor"

type RudeusParamsList = {
  register: undefined
  patterns: RudeusUser
  editor: RudeusEditorPattern
}

const Stack = createStackNavigator<RudeusParamsList>()

type RudeusContextValues = {
  register: (name: string) => Promise<RudeusUser>
  share: (pattern: RudeusEditorPattern) => Promise<RudeusPattern>
  patterns: () => Promise<RudeusPattern[]>
  user: () => Promise<RudeusUser | null>
}

const RudeusContext = createContext<RudeusContextValues | undefined>(undefined)

const useRudeusContext = () => useContext(RudeusContext)!

export type RudeusProps = {
  style?: StyleProp<ViewStyle>
} & RudeusContextValues

export const RudeusView = ({ style, ...values }: RudeusProps) => (
  <TiFQueryClientProvider>
    <SafeAreaProvider>
      <RudeusContext.Provider value={values}>
        <RudeusRouterView style={style} />
      </RudeusContext.Provider>
    </SafeAreaProvider>
  </TiFQueryClientProvider>
)

type RudeusRouterProps = {
  style?: StyleProp<ViewStyle>
}

const RudeusRouterView = ({ style }: RudeusRouterProps) => {
  const { user } = useRudeusContext()
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
  const { register } = useRudeusContext()
  const state = useRudeusRegister({
    register,
    onSuccess: (user) => navigation.replace("patterns", user)
  })
  return <RudeusRegisterView state={state} style={styles.screen} />
}

const PatternsScreen = ({
  route,
  navigation
}: StackScreenProps<RudeusParamsList, "patterns">) => {
  const { patterns } = useRudeusContext()
  return (
    <RudeusPatternsView
      patterns={patterns}
      onCreatePatternTapped={() => {
        navigation.navigate("editor", EMPTY_PATTERN_EDITOR_PATTERN)
      }}
      onPatternTapped={(p) => {
        navigation.navigate("editor", editorPattern(p, route.params.id))
      }}
      style={styles.screen}
    />
  )
}

const EditorScreen = ({
  route
}: StackScreenProps<RudeusParamsList, "editor">) => {
  const { share } = useRudeusContext()
  return (
    <RudeusPatternEditorView
      state={useRudeusPatternEditor(route.params, { share })}
      style={styles.screen}
    />
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  screen: { height: "100%", flex: 1 },
  userHeader: { paddingRight: 24 }
})
