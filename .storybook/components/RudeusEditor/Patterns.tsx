import {
  StyleProp,
  ViewStyle,
  StyleSheet,
  View,
  ActivityIndicator
} from "react-native"
import { RudeusPattern } from "./Models"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import { Headline } from "@components/Text"
import { PrimaryButton } from "@components/Buttons"
import { TiFFormScrollableLayoutView } from "@components/form-components/ScrollableFormLayout"
import { TiFFooterView } from "@components/Footer"
import { SafeAreaView } from "react-native-safe-area-context"
import { TiFFormCardView } from "@components/form-components/Card"
import { TiFFormNavigationLinkView } from "@components/form-components/NavigationLink"

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
  const query = useQuery(["rudeus-patterns"], patterns)
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
      title={pattern.name}
      description={`By ${pattern.user.name}`}
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
  }
})
