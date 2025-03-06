import { FormSubmissionPrimaryButton } from "@components/Buttons"
import {
  ClientSideEvent,
  clientSideEventFromResponse
} from "@event/ClientSideEvent"
import { setEventDetailsQueryEvent } from "@event/DetailsQuery"
import { AlertsObject, presentAlert } from "@lib/Alerts"
import { useFormSubmission } from "@lib/utils/Form"
import { useQueryClient } from "@tanstack/react-query"
import { TiFAPI } from "TiFShared/api"
import { EventEdit, EventID } from "TiFShared/domain-models/Event"
import { Atom, atom, useAtomValue } from "jotai"
import React, { useMemo } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { eventEditAtom, isEditEventFormDirtyAtom } from "./FormAtoms"

export type SubmitEventEditResult =
  | { status: "success"; event: ClientSideEvent }
  | {
      status:
        | "event-not-found"
        | "user-not-host"
        | "event-has-ended"
        | "blocked-you"
    }

export type SubmitEventEdit = (
  eventId: EventID | undefined,
  edit: EventEdit
) => Promise<SubmitEventEditResult>

export const submitEventEdit = async (
  eventId: EventID | undefined,
  edit: EventEdit,
  api: TiFAPI = TiFAPI.productionInstance
): Promise<SubmitEventEditResult> => {
  if (!eventId) {
    const resp = await api.createEvent({ body: edit })
    return { status: "success", event: clientSideEventFromResponse(resp.data) }
  }
  const resp = await api.editEvent({ params: { eventId }, body: edit })
  return resp.status === 200
    ? { status: "success", event: clientSideEventFromResponse(resp.data) }
    : { status: resp.data.error }
}

export const ALERTS = {
  submissionError: (eventId?: EventID) => ({
    title: "Oh No!",
    description: !eventId
      ? "It seems that we weren't able to create the event. Please try again."
      : "It seems that we weren't able to update the event. Please try again."
  }),
  "event-not-found": {
    title: "Event Not Found",
    description: "This event does not exist."
  },
  "user-not-host": {
    title: "Cannot Edit Event",
    description: "Only hosts are allowed to edit events."
  },
  "event-has-ended": {
    title: "Event Ended",
    description: "This event has ended."
  },
  "blocked-you": {
    title: "Blocked",
    description: "You have been blocked by the event host."
  }
} satisfies AlertsObject

export type UseEditEventFormSubmissionEnvironment = {
  eventId?: EventID
  onSuccess: (event: ClientSideEvent) => void
  submit: SubmitEventEdit
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
      async (submit: () => Promise<SubmitEventEditResult>) => await submit(),
      () => {
        if (submitForm) {
          return { status: "submittable", submissionValues: submitForm }
        }
        return { status: "invalid" }
      },
      {
        onSuccess: (result) => {
          if (result.status === "success") {
            setEventDetailsQueryEvent(queryClient, result.event)
            onSuccess(result.event)
          } else {
            presentAlert(ALERTS[result.status])
          }
        },
        onError: () => {
          presentAlert(ALERTS.submissionError(eventId))
        }
      }
    )
  }
}

const submitFormAtom = (
  eventId: EventID | undefined,
  submit: SubmitEventEdit
): Atom<(() => Promise<SubmitEventEditResult>) | undefined> => {
  return atom((get) => {
    const isDirty = get(isEditEventFormDirtyAtom)
    const eventEdit = get(eventEditAtom)
    if (!isDirty || !eventEdit) return undefined
    return async () => await submit(eventId, eventEdit)
  })
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
    <FormSubmissionPrimaryButton
      submission={state.submission}
      style={styles.submitButton}
    >
      {!state.eventId ? "Create Event" : "Update Event"}
    </FormSubmissionPrimaryButton>
  </View>
)

const styles = StyleSheet.create({
  submitButton: {
    width: "100%"
  }
})
