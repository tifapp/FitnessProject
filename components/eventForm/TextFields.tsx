import React from "react"
import { StyleSheet, TextInput } from "react-native"
import { useEventFormField } from "./EventForm"

/**
 * The title field for an event form.
 */
export const EventFormTitleField = () => {
  const [title, setTitle] = useEventFormField("title")
  return (
    <TextInput
      placeholder="Title"
      maxLength={75}
      value={title}
      onChangeText={setTitle}
      multiline
      style={styles.title}
    />
  )
}

/**
 * The description field for an event form.
 */
export const EventFormDescriptionField = () => {
  const [description, setDescription] = useEventFormField("description")
  return (
    <TextInput
      placeholder="Description"
      value={description}
      onChangeText={setDescription}
      style={styles.description}
      multiline
    />
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold"
  },
  description: {
    fontSize: 16
  }
})
