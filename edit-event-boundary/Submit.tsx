import { EventEdit, EventID } from "TiFShared/domain-models/Event"
import { useAtomValue } from "jotai"
import React, { useMemo } from "react"
import { submitFormAtom } from "./FormValues"
import { useFormSubmission } from "@lib/utils/Form"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { PrimaryButton } from "@components/Buttons"
import { ClientSideEvent } from "@event/ClientSideEvent"
import { useQueryClient } from "@tanstack/react-query"
import { setEventDetailsQueryEvent } from "@event/DetailsQuery"
import { AlertsObject, presentAlert } from "@lib/Alerts"

export const ALERTS = {
  submissionError: (eventId?: EventID) => ({
    title: "Oh No!",
    description: eventId
      ? "It seems that we weren't able to create the event. Please try again."
      : "It seems that we weren't able to update the event. Please try again."
  })
} satisfies AlertsObject

export type UseEditEventFormSubmissionEnvironment = {
  eventId?: EventID
  onSuccess: (event: ClientSideEvent) => void
  submit: (id: EventID | undefined, edit: EventEdit) => Promise<ClientSideEvent>
}

export const useEditEventFormSubmission = ({
  eventId,
  onSuccess,
  submit
}: UseEditEventFormSubmissionEnvironment) => {
  const submitForm = useAtomValue(
    useMemo(() => submitFormAtom(eventId, submit), [eventId, submit])
  )
  const queryClient = useQueryClient()
  return {
    eventId,
    submission: useFormSubmission(
      async (submit: () => Promise<ClientSideEvent>) => await submit(),
      () => {
        if (submitForm) {
          return { status: "submittable", submissionValues: submitForm }
        }
        return { status: "invalid" }
      },
      {
        onSuccess: (event) => {
          setEventDetailsQueryEvent(queryClient, event)
          onSuccess(event)
        },
        onError: () => {
          presentAlert(ALERTS.submissionError(eventId))
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
}: EditEventFormSubmitButtonProps) => (
  <View style={style}>
    <PrimaryButton
      disabled={state.submission.status !== "submittable"}
      onPress={() => {
        if (state.submission.status === "submittable") {
          state.submission.submit()
        }
      }}
      style={styles.submitButton}
    >
      {!state.eventId ? "Create Event" : "Update Event"}
    </PrimaryButton>
  </View>
)

const styles = StyleSheet.create({
  submitButton: {
    width: "100%"
  }
})
