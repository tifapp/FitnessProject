import { PrimaryButton } from "@components/Buttons"
import { Ionicon } from "@components/common/Icons"
import { TiFFooterView } from "@components/Footer"
import { TiFFormCardView } from "@components/form-components/Card"
import { TiFFormNavigationLinkView } from "@components/form-components/NavigationLink"
import { TiFFormScrollableLayoutView } from "@components/form-components/ScrollableFormLayout"
import { Headline } from "@components/Text"
import { useRefreshOnFocus } from "@lib/utils/UseRefreshOnFocus"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import {
  ActivityIndicator,
  RefreshControl,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { RudeusPattern } from "./Models"

export type RudeusPatternsHeaderProps = {
  username: string
  style?: StyleProp<ViewStyle>
}

export const RudeusPatternsHeaderView = ({
  username,
  style
}: RudeusPatternsHeaderProps) => (
  <View style={style}>
    <View style={styles.patternsHeaderRow}>
      <Ionicon name="person" />
      <Headline>{username}</Headline>
    </View>
  </View>
)

export type RudeusPatternsProps = {
  onPatternTapped: (pattern: RudeusPattern) => void
  onCreatePatternTapped: () => void
  patterns: () => Promise<RudeusPattern[]>
  style?: StyleProp<ViewStyle>
}

export const RudeusPatternsView = ({
  onPatternTapped,
  onCreatePatternTapped,
  patterns,
  style
}: RudeusPatternsProps) => {
  const query = useQuery({
    queryKey: ["rudeus-patterns"], 
    queryFn: patterns
  })
  useRefreshOnFocus(query.refetch)
  return (
    <View style={style}>
      {query.data && (
        <TiFFormScrollableLayoutView
          footer={
            <TiFFooterView>
              <PrimaryButton
                onPress={onCreatePatternTapped}
                style={styles.primaryButton}
              >
                Create New Pattern
              </PrimaryButton>
            </TiFFooterView>
          }
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={query.refetch}
            />
          }
          style={styles.layout}
        >
          <SafeAreaView style={styles.patterns}>
            {query.data.map((p) => (
              <PatternView key={p.id} pattern={p} onTapped={onPatternTapped} />
            ))}
          </SafeAreaView>
        </TiFFormScrollableLayoutView>
      )}
      {query.isLoading && (
        <View style={styles.container}>
          <ActivityIndicator />
        </View>
      )}
      {query.isError && (
        <View style={styles.container}>
          <View style={styles.error}>
            <Headline>An Error Occurred.</Headline>
            <PrimaryButton
              onPress={() => query.refetch()}
              style={styles.primaryButton}
            >
              Try Again
            </PrimaryButton>
          </View>
        </View>
      )}
    </View>
  )
}

type PatternProps = {
  pattern: RudeusPattern
  onTapped: (p: RudeusPattern) => void
}

const PatternView = ({ pattern, onTapped }: PatternProps) => (
  <TiFFormCardView>
    <TiFFormNavigationLinkView
      title={`${pattern.name} (${pattern.platform === "ios" ? "iOS" : "Android"})`}
      description={`by ${pattern.user.name}`}
      onTapped={() => onTapped(pattern)}
    />
  </TiFFormCardView>
)

const styles = StyleSheet.create({
  layout: {
    flex: 1
  },
  container: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  error: {
    rowGap: 16
  },
  primaryButton: {
    width: "100%"
  },
  patterns: {
    rowGap: 16
  },
  patternConatiner: {
    padding: 16
  },
  patternsHeaderRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 8
  }
})
