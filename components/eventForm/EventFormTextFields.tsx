import React from "react"
import { TextInput } from "react-native-gesture-handler"
import { useEventFormField } from "./EventForm"

/**
 * The title field for an event form.
 */
export const EventFormTitleField = () => {
  const [title, setTitle] = useEventFormField("title")
  return <TextInput placeholder="Title" value={title} onChangeText={setTitle} />
}
