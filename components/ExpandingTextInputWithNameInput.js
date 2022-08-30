import UserTagInput from "@screens/UserTagInput";
import React, { useState } from "react";
import ExpandingTextInput from "./ExpandingTextInput";

export default function ExpandingTextInputWithNameInput({
  onSubmit,
  onChangeText,
  onDelete,
  taggedUsers,
  setTaggedUsers,
  ...props
}) {
  const [SignPosition, setSignPosition] = useState(null);
  const [text, setText] = useState("");
  const [newTaggedUserText, setNewTaggedUserText] = useState(null);
  const [cursorPosition, setCursorPosition] = useState([]);
  const [newCursorPosition, setNewCursorPosition] = useState(undefined);
  const [showList, setShowList] = useState(false);

  /*
  const setNewCursorPosition = async (event) => {
    await setCursorPosition([event.nativeEvent.selection.start, event.nativeEvent.selection.end]);
    return new Promise((resolve) => {resolve()});
  }
  */

  const checkCursorInside = (position) => {
    let insideTaggedUser = false;
    let startInvisible = text.lastIndexOf('\u200a', position);
    let endInvisible = text.indexOf('\u200b', position);

    if(startInvisible != -1 && endInvisible != -1) {
      let count = 0;
      
      for(let i = startInvisible; i <= endInvisible; i++) {
        if(text[i] === '\u200a' || text[i] === '\u200b') {
          count++;
        }
      }

      if(count == 2) {
        insideTaggedUser = true;
      }
    }


    if(insideTaggedUser) {
      // Move the cursor to the left or right of the text depending on which is closer
      let distanceToStart = position - startInvisible;
      let distanceToEnd = endInvisible - position;

      if(distanceToEnd < distanceToStart) {
        let newPosition = endInvisible + 1;
        setNewCursorPosition({start: newPosition, end: newPosition});
      }
      else {
        let newPosition = startInvisible;
        setNewCursorPosition({start: newPosition, end: newPosition});
      }
    }
    else {
      setNewCursorPosition(undefined);
    }

  }

  return (
    <>
      <ExpandingTextInput
        {...props}
        selection={newCursorPosition}
        onSelectionChange={(event) => {
          //console.log("onSelectionChange");
          //setCursorPosition([event.nativeEvent.selection.start, event.nativeEvent.selection.end]);
          // Ignore any non tagged user text
          // If user typed in an '@' sign then we need to display the
          //console.log("Start position is " + event.nativeEvent.selection.start);
          //console.log("End position is " + event.nativeEvent.selection.end);
          setCursorPosition([event.nativeEvent.selection.start, event.nativeEvent.selection.end]);
          checkCursorInside(event.nativeEvent.selection.start);
          
          // Check if the cursor is next to the '@' sign string
          const index = text.lastIndexOf("@", cursorPosition[0]);

          if (index == -1 ) {
            return;
          }

          for (let i = index; i < cursorPosition[0]; i++) {
            if (text[i] === ' ') {
              setShowList(false);
              return;
            }
          }

          setSignPosition(text.lastIndexOf("@", cursorPosition[0]) + 1);
          setShowList(true);
        }}
        onChangeText={(newText) => {
          //console.log("onChangeText");
          if(newTaggedUserText === null) {
            onChangeText(newText);
            setText(newText);
          } else {
            onChangeText(newTaggedUserText);
            setText(newTaggedUserText);
            setNewTaggedUserText(null);
          }

        }}
        onKeyPress={({nativeEvent}) => {
          if (nativeEvent.key === 'Backspace') {
            let count = 0;

            // Check if the cursor is within or next to the tagged user
            // Count the number of tagged users that are within the text input

            
            for(let i = 0; i <= cursorPosition[0]; i++) {
              if(text[i] === '\u200a') {
                count++;
              }
            }

            let startInvisible = text.lastIndexOf('\u200a', cursorPosition[0]);
            let endInvisible = text.lastIndexOf('\u200b', cursorPosition[0]);


            // Check if character to the left of the cursor is an invisible character
            if(cursorPosition[0] === endInvisible + 1) {
              // Delete the tagged user from the array
              taggedUsers.splice(count-1, 1);
              setTaggedUsers(taggedUsers);

              // Modify the text input string to remove the tagged user text
              let newTaggedUserText = text.substring(0, startInvisible) + text.substring(endInvisible + 1);
              setNewTaggedUserText(newTaggedUserText);

            }

          }
        }}         
        value={text}
      />
      { showList && (
        <UserTagInput
          query={text.slice(SignPosition, cursorPosition[0])}
          onAdd={(userId) => {
            setShowList(false);
            setText(`${text.substring(0,text.lastIndexOf("@", SignPosition))}\u200a@${global.savedUsers[userId].name}\u200b${text.substring(cursorPosition[0])}`);
            onChangeText(`${text.substring(0,text.lastIndexOf("@", SignPosition))}\u200a@${global.savedUsers[userId].name}\u200b${text.substring(cursorPosition[0])}`);
            onSubmit(userId);
            
            // Test
            //save selection
          }}
        />
      )}
    </>
  );
}
