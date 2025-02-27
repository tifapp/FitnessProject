import { PrimaryButton, SecondaryOutlinedButton } from "@components/Buttons"
import { TiFFooterView } from "@components/Footer"
import { ShadedTextField } from "@components/TextFields"
import { TiFFormScrollableLayoutView } from "@components/form-components/ScrollableFormLayout"
import { TiFFormSectionView } from "@components/form-components/Section"
import { AppStyles } from "@lib/AppColorStyle"
import { useFontScale } from "@lib/Fonts"
import {
  HapticPatternElement,
  transientEvent,
  useHaptics
} from "@modules/tif-haptics"
import { StyleProp, ViewStyle, StyleSheet, View, TextStyle } from "react-native"
import { RudeusAPI } from "./RudeusAPI"
import { Platform } from "react-native"
import {
  RudeusEditablePatternElement,
  RudeusEditablePatternEventID,
  RudeusEditorPattern,
  RudeusPattern,
  RudeusPlatform
} from "./Models"
import { useState } from "react"
import { Caption, Headline } from "@components/Text"
import { PrimitiveAtom, atom, useAtom, useAtomValue, useStore } from "jotai"
import { AlertsObject, presentAlert } from "@lib/Alerts"
import { useFormSubmission } from "@lib/utils/Form"
import { Store } from "@lib/Jotai"
import { uuidString } from "TiFShared/lib/UUID"
import { TouchableIonicon } from "@components/common/Icons"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { TiFDefaultLayoutTransition } from "@lib/Reanimated"
import {
  RudeusPatternElementEditorView,
  useRudeusPatternElementEditor
} from "./PatternElementEditor"

export const sharePattern = async (
  pattern: RudeusEditorPattern,
  api: RudeusAPI
) => {
  return (
    await api.sharePattern({
      body: { ...pattern, platform: Platform.OS as RudeusPlatform }
    })
  ).data
}

export const ALERTS = {
  sharedSuccessfully: {
    title: "Shared Successfully",
    description: "Your pattern was shared successfully!"
  },
  sharedUnsuccessfully: {
    title: "Failed to Share Pattern",
    description: "The pattern could not be shared. Please reach out on slack."
  }
} satisfies AlertsObject

export type UseRudeusPatternEditorEnvironment = {
  share: (pattern: RudeusEditorPattern) => Promise<RudeusPattern>
}

export const useRudeusPatternEditor = (
  initialPattern: RudeusEditorPattern,
  { share }: UseRudeusPatternEditorEnvironment
) => {
  const [pattern, setPattern] = useState({
    id: initialPattern.id,
    name: atom(initialPattern.name),
    description: atom(initialPattern.description),
    events: initialPattern.ahapPattern.Pattern.map((element) => ({
      id: uuidString(),
      atom: atom({ isHidden: false, element })
    })),
    version: initialPattern.ahapPattern.Version
  })
  const { play } = useHaptics()
  const name = useAtomValue(pattern.name)
  const store = useStore()
  return {
    pattern,
    eventAdded: (afterId?: RudeusEditablePatternEventID) => {
      const id = uuidString()
      const newEvent = {
        element: { Event: transientEvent(0, {}) },
        isHidden: false
      }
      setPattern((p) => {
        const index = p.events.findIndex((e) => e.id === afterId)
        if (index === -1) {
          return {
            ...p,
            events: [...p.events, { id, atom: atom(newEvent) }]
          }
        }
        return {
          ...p,
          events: [
            ...p.events.slice(0, index + 1),
            { id, atom: atom(newEvent) },
            ...p.events.slice(index + 1)
          ]
        }
      })
    },
    eventRemoved: (id: RudeusEditablePatternEventID) => {
      setPattern((p) => ({ ...p, events: p.events.filter((e) => e.id !== id) }))
    },
    played: () => {
      play(playablePattern(store, pattern, (isHidden) => !isHidden))
    },
    submission: useFormSubmission(
      async (p: typeof pattern) => {
        return await share({
          id: p.id,
          name: store.get(p.name),
          description: store.get(p.description),
          ahapPattern: playablePattern(store, p)
        })
      },
      () => {
        if (name.length === 0 || pattern.events.length === 0) {
          return { status: "invalid" }
        }
        return { status: "submittable", submissionValues: pattern }
      },
      {
        onSuccess: (pattern) => {
          setPattern((p) => ({
            ...p,
            id: pattern.id,
            version: pattern.ahapPattern.Version
          }))
          presentAlert(ALERTS.sharedSuccessfully)
        },
        onError: () => presentAlert(ALERTS.sharedUnsuccessfully)
      }
    )
  }
}

type RudeusPatternEditorEvent = {
  id: RudeusEditablePatternEventID
  atom: PrimitiveAtom<RudeusEditablePatternElement>
}

const playablePattern = (
  store: Store,
  pattern: { events: RudeusPatternEditorEvent[]; version: number },
  predicate?: (isHidden: boolean, element: HapticPatternElement) => boolean
) => {
  const elements = pattern.events.ext.compactMap((e) => {
    const { isHidden, element } = store.get(e.atom)
    if (predicate && !predicate(isHidden, element)) return undefined
    return element
  })
  return { Pattern: elements, Version: 1 }
}

export type RudeusPatternEditorProps = {
  state: ReturnType<typeof useRudeusPatternEditor>
  style?: StyleProp<ViewStyle>
}

export const RudeusPatternEditorView = ({
  state,
  style
}: RudeusPatternEditorProps) => (
  <View style={style}>
    <TiFFormScrollableLayoutView
      footer={
        <TiFFooterView>
          <Caption>Pattern Version: {state.pattern.version}</Caption>
          <View style={styles.footerRow}>
            <PrimaryButton onPress={state.played} style={styles.playButton}>
              Play
            </PrimaryButton>
            <SecondaryOutlinedButton
              disabled={state.submission.status !== "submittable"}
              onPress={() => {
                if (state.submission.status === "submittable") {
                  state.submission.submit()
                }
              }}
              style={styles.playButton}
            >
              Share
            </SecondaryOutlinedButton>
          </View>
        </TiFFooterView>
      }
      style={styles.layout}
    >
      <AtomTextFieldSectionView
        title="Name"
        atom={state.pattern.name}
        placeholder="Enter a Name"
        textStyle={{ height: 32 * useFontScale() }}
      />
      <AtomTextFieldSectionView
        title="Description"
        atom={state.pattern.description}
        multiline
        textAlignVertical="top"
        placeholder="Enter a Description"
        textStyle={{ minHeight: 128 * useFontScale() }}
      />
      {state.pattern.events.length === 0 ? (
        <TiFFormSectionView>
          <PrimaryButton onPress={() => state.eventAdded()}>
            Add Event
          </PrimaryButton>
        </TiFFormSectionView>
      ) : (
        <TiFFormSectionView title="Events">
          {state.pattern.events.map((event) => (
            <Animated.View
              key={event.id}
              layout={TiFDefaultLayoutTransition}
              entering={FadeIn}
              exiting={FadeOut}
              style={styles.eventColumn}
            >
              <PatternEventEditorView
                event={event}
                onDeleteTapped={() => state.eventRemoved(event.id)}
              />
              <TouchableIonicon
                icon={{ name: "add-circle", size: 32 }}
                onPress={() => state.eventAdded(event.id)}
              />
            </Animated.View>
          ))}
        </TiFFormSectionView>
      )}
    </TiFFormScrollableLayoutView>
  </View>
)

type PatternEventEditorProps = {
  event: RudeusPatternEditorEvent
  onDeleteTapped: () => void
}

const PatternEventEditorView = ({
  event,
  onDeleteTapped
}: PatternEventEditorProps) => {
  const state = useRudeusPatternElementEditor(event.atom)
  return (
    <RudeusPatternElementEditorView
      state={state}
      onDeleteTapped={onDeleteTapped}
      style={styles.elementEditor}
    />
  )
}

type AtomTextFieldSectionProps = {
  atom: PrimitiveAtom<string>
  title: string
  multiline?: boolean
  textAlignVertical?: "top"
  placeholder: string
  textStyle: StyleProp<TextStyle>
}

const AtomTextFieldSectionView = ({
  atom,
  multiline = false,
  title,
  textAlignVertical,
  placeholder,
  textStyle
}: AtomTextFieldSectionProps) => {
  const [text, setText] = useAtom(atom)
  return (
    <TiFFormSectionView title={title}>
      <ShadedTextField
        value={text}
        multiline={multiline}
        onChangeText={setText}
        textAlignVertical={textAlignVertical}
        placeholder={placeholder}
        textStyle={textStyle}
      />
    </TiFFormSectionView>
  )
}

const styles = StyleSheet.create({
  footerRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 16,
    marginTop: 16
  },
  playButton: {
    flex: 1
  },
  shareButton: {
    flex: 1,
    backgroundColor: "white"
  },
  shareButtonContent: {
    color: AppStyles.primaryColor
  },
  layout: {
    flex: 1
  },
  elementEditor: {
    width: "100%"
  },
  eventColumn: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    rowGap: 16
  },
  card: {
    padding: 16
  }
})
