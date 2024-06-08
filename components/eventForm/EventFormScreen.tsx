import { EventFormBottomSheet } from "@components/eventForm/BottomSheet"
import { SaveEventRequest } from "@lib/events"
import React from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { Divider } from "react-native-elements"
import { ScrollView } from "react-native-gesture-handler"
import {
  EventForm,
  EventFormDismissButton,
  EventFormLocationBanner,
  EventFormSubmitButton,
  EventFormTextField,
  EventFormToolbar,
  EventFormValues
} from "."

export type EventFormScreenProps = {
  initialValues: EventFormValues
  submissionLabel: string
  onSubmit: (editInput: SaveEventRequest) => Promise<void>
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
    <View style={styles.padding}>
      <EventFormSubmitButton label={submissionLabel} />
    </View>
    <View style={styles.padding}>
      <EventFormDismissButton />
    </View>
    <TextFields />
    <Footer />
    <EventFormBottomSheet />
  </EventForm>
)

const TextFields = () => (
  <ScrollView contentContainerStyle={styles.padding}>
    <EventFormTextField
      placeholder="Title"
      fieldName="title"
      multiline
      maxLength={50}
      style={styles.title}
    />
    <View style={styles.textFieldsSpacer} />
    <EventFormTextField
      placeholder="Description"
      fieldName="description"
      multiline
      style={styles.description}
    />
  </ScrollView>
)

const Footer = () => (
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={styles.footer}
  >
    <Divider />
    <View style={styles.locationBanner}>
      <EventFormLocationBanner />
    </View>
    <Divider />
    <EventFormToolbar containerStyle={styles.toolbar} />
  </KeyboardAvoidingView>
)

const styles = StyleSheet.create({
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
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  footer: {
    flex: 1,
    position: "absolute",
    bottom: 0,
    minHeight: "100%",
    minWidth: "100%",
    backgroundColor: "white"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold"
  },
  description: {
    fontSize: 16
  },
  header: {
    shadowColor: "transparent",
    elevation: 0
  },
  card: {
    backgroundColor: "white"
  },
  locationBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8
  }
})

export default EventFormScreen
