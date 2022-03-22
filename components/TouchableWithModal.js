import React, { useCallback, useState } from "react";
import { Modal, TouchableOpacity, View } from "react-native";

// @ts-ignore
var styles = require("styles/stylesheet");

//currently this is just used in the profile screen for the bio and goals descriptions
//later we can make this a generic touchable that causes a transparent modal to appear at the bottom of the screen, and pass in the children from the parent

export default function TouchableWithModal({
  modalComponent,
  style = {},
  children,
  dontShowModalOnPress = false,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <TouchableOpacity
        onPress={dontShowModalOnPress ? null : showModal}
        style={style}
      >
        {children}
      </TouchableOpacity>

      <Modal transparent={true} visible={isModalOpen} animationType="slide">
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={hideModal}
          ></TouchableOpacity>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              backgroundColor: "white",
              alignItems: "flex-end",
              marginTop: "auto",
            }}
          >
            {typeof modalComponent === "function"
              ? modalComponent(hideModal)
              : modalComponent}
          </View>
        </View>
      </Modal>
    </>
  );
}
