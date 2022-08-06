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
          
          onChangeText(newText);
          setText(newText);

          // Ignore any non tagged user text
          // If user typed in an '@' sign then we need to display the 

          // Check if the cursor is next to the '@' sign string
          const index = newText.lastIndexOf("@", cursorPosition);

          if (index == -1 ) {
            return;
          }

          for (let i = index; i < cursorPosition; i++) {
            if (newText[i] === ' ') {
              setShowList(false);
              return;
            }
          }

          setSignPosition(newText.lastIndexOf("@", cursorPosition) + 1);
          setShowList(true);

        }}         
        value={text}
      />
      { showList && (
        <UserTagInput
          query={text.slice(SignPosition, cursorPosition[0])}
          onAdd={(userId) => {
            setShowList(false);
            setText(`${text.substring(0,text.lastIndexOf("@", SignPosition))}\u200a${global.savedUsers[userId].name}\u200b${text.substring(cursorPosition[0])}`);
            onChangeText(`${text.substring(0,text.lastIndexOf("@", SignPosition))}\u200a${global.savedUsers[userId].name}\u200b${text.substring(cursorPosition[0])}`);
            onSubmit(userId);
            
            // Test
            //save selection
          }}
        />
      )}
    </>
  );
}
