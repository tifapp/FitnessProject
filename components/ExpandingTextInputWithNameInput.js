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
          } else if (showUsers && ((newText.length < showUsers) || newText.lastIndexOf(" ") > newText.lastIndexOf("@"))) {
            setShowUsers();
          } else if(!showUsers && newText.lastIndexOf(" ") < newText.lastIndexOf("@")) {
            setShowUsers(newText.lastIndexOf("@") + 1);
          }
        }}
        value={text}
      />
      {showUsers && (
        <UserTagInput
          query={text.substring(showUsers)}
          onAdd={(userId) => {
            setShowUsers();
            setText(text.substring(0,text.lastIndexOf("@")) + global.savedUsers[userId].name);
            onChangeText(text.substring(0,text.lastIndexOf("@")) + global.savedUsers[userId].name);
            console.log(global.savedUsers[userId].name);
            onAdd(userId);
            //save selection
          }}
        />
      )}
    </>
  );
}
