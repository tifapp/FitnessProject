import UserTagInput from "@screens/UserTagInput";
import React, { useState } from "react";
import { TextInputProps } from "react-native";
import ExpandingTextInput from "./ExpandingTextInput";

interface Props extends TextInputProps {
  onSubmit: (s : string) => void,
  setText: React.Dispatch<React.SetStateAction<string>>,
  text: string,
  onDelete: (s : string) => void,
  taggedUsers: string[] | undefined,
  setTaggedUsers: React.Dispatch<React.SetStateAction<string[] | undefined>>,
  onChangeText: React.Dispatch<React.SetStateAction<string>>
}


export default function ExpandingTextInputWithNameInput({
  onSubmit,
  onChangeText,
  setText,
  text,
  onDelete,
  taggedUsers,
  setTaggedUsers,
  ...props
} : Props) {
  const [SignPosition, setSignPosition] = useState<number>(0); // May cause error setting default to 0 10/22/2022 
  const [newTaggedUserText, setNewTaggedUserText] = useState<string | null>(null); // May cause error 10/22/2022
  const [cursorPosition, setCursorPosition] = useState<[number, number]>([0,0]); // Test for possible issue 10/20/2022
  const [newCursorPosition, setNewCursorPosition] = useState<TextInputProps["selection"]>(undefined);
  const [showList, setShowList] = useState(false);
  const [modifyText, setModifyText] = useState(false);

  const findTaggedUser = (position: number) => {
    let count = 0;
    for(let i = 0; i < position; i++) {
      if(text[i] === '\u200a') {
        count++;
      }
    }
    return count;
  }

  // Potential Issue the onChange text callback needs to be called before the onSelectionChange callback
  // Since the text is not updated by the time this function calls, the cursor position is within the tagged user text
  // This is where the main problem is occurring
  // If we are adding text or deleting a char we do not want to go inside this function

  const isCursorInside = (position:number) => {
    let insideTaggedUser = false;

    if(position < 1) {
      setNewCursorPosition(undefined);
      return;
    }

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
        setCursorPosition([newPosition, newPosition]);
      }
      else {
        let newPosition = startInvisible;
        setNewCursorPosition({start: newPosition, end: newPosition});
        setCursorPosition([newPosition, newPosition]);
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
          // Ignore any non tagged user text
          // If user typed in an '@' sign then we need to display the
          setCursorPosition([event.nativeEvent.selection.start, event.nativeEvent.selection.end]);
          // Error in this section of the code
          if(!modifyText) {
            isCursorInside(event.nativeEvent.selection.start);
          } else {
            setNewCursorPosition(undefined);
            setModifyText(false);
          }

          // When deleting a tagged user using the old cursor position is best 
          // Whereas updating the cursor position inside tagged user text it is best to use the event.nativeEvent.selection.start  

          // Check if the cursor is next to the '@' sign string
          const index = text.lastIndexOf("@", cursorPosition[0]);

          if (index == -1 ) {
            return;
          }

          // Fixed: Need to determine the difference between a newly tagged user and about to tag a user
          for (let i = index; i < cursorPosition[0]; i++) {
            if (text[i] === ' ' || text[i] === '\u200b') {
              setShowList(false);
              return;
            }
          }

          setSignPosition(text.lastIndexOf("@", cursorPosition[0]) + 1);
          setShowList(true);
        }}
        onChangeText={(newText) => {

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
          setModifyText(true);
          
          if (nativeEvent.key === 'Backspace') {

            // Check if the cursor is within or next to the tagged user
            // Count the number of tagged users that are within the text input

            if(cursorPosition[0] == 0) {
              return;
            }

            let startInvisible = text.lastIndexOf('\u200a', cursorPosition[0]-1);
            let endInvisible = text.lastIndexOf('\u200b', cursorPosition[0]-1);

            // Check if character to the left of the cursor is an invisible character
            if(cursorPosition[0] === endInvisible + 1) {
              // Delete the tagged user from the array
              let indexTaggedUser = findTaggedUser(cursorPosition[0]);
              taggedUsers?.splice(indexTaggedUser-1, 1);
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
            setText(`${text.substring(0, text.lastIndexOf("@", SignPosition))}\u200a@${globalThis.savedUsers[userId].name}\u200b${text.substring(cursorPosition[0])}`);
            onChangeText(`${text.substring(0, text.lastIndexOf("@", SignPosition))}\u200a@${globalThis.savedUsers[userId].name}\u200b${text.substring(cursorPosition[0])}`);
            onSubmit(userId);

            // Test
            //save selection
          } }  
          /*
          Remove the top 3 props later since we are not using them but were required 10/20/2022
          */      
          />
      )}
    </>
  );
}
