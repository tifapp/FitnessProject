import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StoryMeta } from "storybook/HelperTypes";
import { DragAndDropSelect } from "./DragAndDrop";

export const DragAndDropMeta: StoryMeta = {
  title: "DragAndDrop",
};

export default DragAndDropMeta;

const myQuestion = {
  text: "What is the capital of France?",
  correctAnswer: "paris",
  options: [
    { id: "london", text: "London" },
    { id: "berlin", text: "Berlin" },
    { id: "paris", text: "Paris" },
    { id: "madrid", text: "Madrid" },
  ],
};


export const Basic = () => (
  <GestureHandlerRootView>
  <DragAndDropSelect 
    question={myQuestion}
    onAnswerSelected={(answerId) => console.log('Selected:', answerId)}
    onAnswerCorrect={() => console.log('Correct!')}
    onAnswerIncorrect={() => console.log('Try again!')}
  />
  </GestureHandlerRootView>
);
