import UserTagInput from "@screens/UserTagInput";
import React, { useState } from "react";
import ExpandingTextInput from "./ExpandingTextInput";

export default function ExpandingTextInputWithNameInput({
  onAdd,
  onChangeText,
  ...props
}) {
  const [showUsers, setShowUsers] = useState();
  const [text, setText] = useState("");

  return (
    <>
      <ExpandingTextInput
        {...props}
        onChangeText={(newText) => {
          onChangeText(newText);
          setText(newText);
          if (!showUsers && newText.slice(-1) === "@") {
            //localize?
            setShowUsers(newText.length);
          } else if (showUsers && newText.length < showUsers) {
            setShowUsers();
          }
        }}
        value={text}
      />
      {showUsers && (
        <UserTagInput
          query={text.substring(showUsers)}
          onAdd={(userId) => {
            setShowUsers();
            onAdd(userId);
            //save selection
          }}
        />
      )}
    </>
  );
}
