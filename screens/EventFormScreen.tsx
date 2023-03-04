import { EditEventInput } from "@lib/events"
import { useFontScale } from "@lib/FontScale"
import React from "react"
import { SafeAreaView, StyleSheet, View } from "react-native"
import {
  EventForm,
  EventFormDescriptionField,
  EventFormDismissButton,
  EventFormLocationBanner,
  EventFormSubmitButton,
  EventFormTitleField,
  EventFormToolbar,
  EventFormValues
} from "../components/eventForm"

export type EventFormScreenProps = {
  initialValues: EventFormValues
  submissionLabel: string
  onSubmit: (editInput: EditEventInput) => Promise<void>
  onDismiss: () => void
}

const EventFormScreen = ({
  initialValues,
  onSubmit,
  submissionLabel,
  onDismiss
}: EventFormScreenProps) => (
  <EventForm
    initialValues={initialValues}
    onSubmit={onSubmit}
    onDismiss={onDismiss}
  >
    <SafeAreaView style={styles.container}>
      <Header submissionLabel={submissionLabel} />
      <TextFields />
      <EventFormLocationBanner />
      <EventFormToolbar
        style={{ ...styles.toolbar, height: 44 * useFontScale() }}
      />
    </SafeAreaView>
  </EventForm>
)

type HeaderProps = {
  submissionLabel: string
}

const Header = ({ submissionLabel }: HeaderProps) => (
  <View style={styles.padding}>
    <View style={styles.headerRow}>
      <EventFormDismissButton />
      <EventFormSubmitButton label={submissionLabel} />
    </View>
  </View>
)

const TextFields = () => (
  <View style={styles.padding}>
    <EventFormTitleField />
    <View style={styles.textFieldsSpacer} />
    <EventFormDescriptionField />
  </View>
)

const styles = StyleSheet.create({
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  textFieldsContainer: {
    paddingHorizontal: 16
  },
  textFieldsSpacer: {
    marginTop: 8
  },
  container: {
    minHeight: "100%"
  },
  padding: {
    paddingHorizontal: 16
  },
  toolbar: {
    minHeight: "100%",
    paddingHorizontal: 16
  }
})

export default EventFormScreen
