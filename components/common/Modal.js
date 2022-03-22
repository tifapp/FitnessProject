import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, Pressable, View } from "react-native";

const StyledModal = forwardRef(({ children }, ref) => {
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    showModal() {
      setVisible(true);
    },

    hideModal() {
      setVisible(false);
    },
  }));

  return (
    <Modal
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <Pressable
        onPress={() => setVisible(false)}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          backgroundColor: "#00000033",
        }}
      />

      <View
        style={{ marginTop: "auto", flex: 0.8, backgroundColor: "#a9efe0" }}
      >
        <View
          style={{
            height: 1,
            width: "100%",
            alignSelf: "center",
            backgroundColor: "lightgray",
          }}
        />
        <View
          style={{
            margin: 10,
            width: 25,
            height: 2,
            alignSelf: "center",
            backgroundColor: "lightgray",
          }}
        />
        {children}
      </View>
    </Modal>
  );
});

export default StyledModal;
