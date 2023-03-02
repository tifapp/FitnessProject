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
      maxLength={MAX_TITLE_LENGTH}
      value={title}
      onChangeText={(text) => {
        setTitle(text.substring(0, Math.min(text.length, MAX_TITLE_LENGTH)))
      }}
    />
  )
}

const MAX_TITLE_LENGTH = 75

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
