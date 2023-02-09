import React, { useCallback, useState } from "react"
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native"

// currently this is just used in the profile screen for the bio and goals descriptions
// later we can make this a generic touchable that causes a transparent modal to appear at the bottom of the screen, and pass in the children from the parent

export default function TouchableTextInputWithModal ({
  modalComponent,
  onEndEditing,
  label,
  placeholder
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [textValue, setTextValue] = useState("")

  const showModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  return (
    <>
      <TouchableOpacity
        style={{
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1
          },
          shadowOpacity: 0.18,
          shadowRadius: 1.0,
          marginBottom: 20,
          marginHorizontal: 20,

          elevation: 1,
          padding: 15,
          flex: 0
        }}
      >
        <Text style={{ fontSize: 18, color: "gray", marginBottom: 5 }}>
          {label}
        </Text>
        <TextInput
          onFocus={showModal}
          placeholder={placeholder}
          multiline={true}
          autoCorrect={false}
          value={textValue}
          onChangeText={setTextValue}
          style={{ fontSize: 18 }}
          onEndEditing={onEndEditing}
        />
      </TouchableOpacity>

      <Modal transparent={true} visible={isModalOpen} animationType="slide">
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setIsModalOpen(false)}
          ></TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              backgroundColor: "white",
              alignItems: "flex-end",
              marginTop: "auto"
            }}
          >
            {modalComponent}
          </View>
        </View>
      </Modal>
    </>
  )
}
