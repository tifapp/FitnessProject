import { EventFormBottomSheet } from "@components/eventForm/BottomSheet"
import { EditEventInput } from "@lib/events"
import { useFontScale } from "@lib/FontScale"
import React from "react"
import {
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native"
import {
  EventForm,
  EventFormDismissButton,
  EventFormLocationBanner,
  EventFormSubmitButton,
  EventFormTextField,
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
      <Footer />
    </SafeAreaView>
    <EventFormBottomSheet />
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
    <EventFormTextField
      placeholder="Title"
      fieldName="title"
      multiline
      maxLength={75}
      style={styles.title}
    />
    <View style={styles.textFieldsSpacer} />
    <EventFormTextField
      placeholder="Description"
      fieldName="description"
      style={styles.description}
    />
  </View>
)

const Footer = () => (
  <KeyboardAvoidingView behavior="padding" style={styles.footer}>
    <EventFormLocationBanner />
    <EventFormToolbar
      scrollStyle={{ height: 44 * useFontScale() }}
      containerStyle={styles.toolbar}
    />
  </KeyboardAvoidingView>
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
  },
  footer: {
    flex: 1,
    position: "absolute",
    bottom: 16,
    minHeight: "100%",
    minWidth: "100%"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold"
  },
  description: {
    fontSize: 16
  }
})

export default EventFormScreen
