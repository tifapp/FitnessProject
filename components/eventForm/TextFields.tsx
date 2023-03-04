import React from "react"
import { TextInput } from "react-native"
import { useEventFormField } from "."

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
    />
  )
}
