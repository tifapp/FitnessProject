import { EventEdit, EventID } from "TiFShared/domain-models/Event"
import { useAtomValue } from "jotai"
import React, { useMemo } from "react"
import { submitFormAtom } from "./FormValues"
import { useFormSubmission } from "@lib/utils/Form"
import { Alert, StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { PrimaryButton } from "@components/Buttons"

export const ALERTS = {
  submissionError: (eventId?: EventID) => ({
    title: "Oh No!",
    message: eventId
      ? "What could've possibly gone wrong creating this event???"
      : "What could've possibly gone wrong editing this event???"
  })
}

export type UseEditEventFormSubmissionEnvironment = {
  eventId?: EventID
  onSuccess: () => void
  submit: (id: EventID | undefined, edit: EventEdit) => Promise<void>
}

export const useEditEventFormSubmission = ({
  eventId,
  onSuccess,
  submit
}: UseEditEventFormSubmissionEnvironment) => {
  const submitForm = useAtomValue(
    useMemo(() => submitFormAtom(eventId, submit), [eventId, submit])
  )
  return {
    eventId,
    submission: useFormSubmission(
      async (submit) => await submit?.(),
      () => {
        if (submitForm) {
          return { status: "submittable", submissionValues: submitForm }
        }
        return { status: "invalid" }
      },
      {
        onSuccess,
        onError: () => {
          const alertContents = ALERTS.submissionError(eventId)
          Alert.alert(alertContents.title, alertContents.message)
        }
      }
    )
  }
}

export type EditEventFormSubmitButtonProps = {
  state: ReturnType<typeof useEditEventFormSubmission>
  style?: StyleProp<ViewStyle>
}

export const EditEventFormSubmitButton = ({
  state,
  style
}: EditEventFormSubmitButtonProps) => {
  return (
    <View style={style}>
      <PrimaryButton
        title={!state.eventId ? "Create Event" : "Update Event"}
        disabled={state.submission.status !== "submittable"}
        onPress={() => {
          if (state.submission.status === "submittable") {
            state.submission.submit()
          }
        }}
        style={styles.submitButton}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  submitButton: {
    width: "100%"
  }
})
