import UserTagInput from "@screens/UserTagInput";
import React, { useState } from "react";
import ExpandingTextInput from "./ExpandingTextInput";

export default function ExpandingTextInputWithNameInput({
  onSubmit,
  onChangeText,
  onDelete,
  ...props
}) {
  const [SignPosition, setSignPosition] = useState(null);
  const [text, setText] = useState("");
  const [cursorPosition, setCursorPosition] = useState([]);
  const [showList, setShowList] = useState(false);


  return (
    <>
      <ExpandingTextInput
        {...props}
        onSelectionChange={(event) => {
          setCursorPosition([event.nativeEvent.selection.start, event.nativeEvent.selection.end]);
        }}
        onChangeText={(newText) => {
          onSubmit(newText);
          onChangeText(newText);
          setText(newText);

          // Ignore any non tagged user text
          // If user typed in an '@' sign then we need to display the options

          if (!showList && newText.slice(-1) === '@') {
            //localize?
            setSignPosition(newText.lastIndexOf("@") + 1);
            setShowList(true);
          }

        }}
        value={text}
      />
      { showList && (
        <UserTagInput
          query={text.slice(SignPosition, cursorPosition[0])}
          onAdd={(userId) => {
            setShowList(false);
            //console.log(text.substring(SignPosition));
            //setSignPosition(null);
            setText(`${text.substring(0,text.lastIndexOf("@", SignPosition))}@${global.savedUsers[userId].name}\u200b${text.substring(cursorPosition[0])}`);
            onChangeText(`${text.substring(0,text.lastIndexOf("@", SignPosition))}@${global.savedUsers[userId].name}\u200b${text.substring(cursorPosition[0])}`);
            onSubmit(userId);
            
            // Test
            //save selection
          }}
        />
      )}
    </>
  );
}
