import React from "react"
import { TextInput } from "react-native-gesture-handler"
import { useEventFormField } from "./EventForm"

export const EventFormTitleField = () => {
  const [title, setTitle] = useEventFormField<string>("title")
  return <TextInput placeholder="Title" value={title} onChangeText={setTitle} />
}
