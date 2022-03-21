import React, { useState } from "react";
import { View, StyleSheet, Modal } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import AgePicker from "./AgePicker";
import GenderPicker from "./GenderPicker";

const Selector = ({ label, modalOpen, setModalOpen, field, updateField }) => {
  const [selectedValue, setSelectedValue] = useState("");

  const fieldHandler = () => {
    if (selectedValue != field) {
      updateField(selectedValue);
    }
    setModalOpen(false);
  };
  return (
    <Modal transparent={true} visible={modalOpen} animationType="slide">
      <View style={styles.modalStyle}>
        <AntDesign
          onPress={() => fieldHandler()}
          style={styles.exitModalButton}
          name="closecircle"
          size={18}
          color="black"
        />

        {label == "age" ? (
          <AgePicker
            field={field}
            selectedValue={selectedValue}
            setSelectedValue={setSelectedValue}
          />
        ) : (
          <GenderPicker
            field={field}
            selectedValue={selectedValue}
            setSelectedValue={setSelectedValue}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalStyle: {
    flex: 1,
    marginTop: 350,
    width: "100%",
    backgroundColor: "white",
  },
  exitModalButton: {
    marginVertical: 5,
    marginLeft: 5,
  },
});

export default Selector;
