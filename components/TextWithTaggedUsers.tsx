import React, { useEffect, useState } from "react";
import {
  Dimensions, Text
} from "react-native";
import LinkableText from "./LinkableText";

interface Props {
  textInput?: string;
}

export default function TextWithTaggedUsers({
  textInput
} : Props) {
  const [textComponents, setTextComponents] = useState<string[]>();
  
  const findTaggedUser = (taggedUser: string) => {
    let taggedUserIndex = 0;

    for(let i in textComponents) {
      if(textComponents[i] === taggedUser) {
        break;
      }
      else if(textComponents[i].includes('\u200a')) {
        taggedUserIndex++;
      }
    }

    goToProfile(item.taggedUsers[taggedUserIndex]);
  }

  useEffect(() => {
    let subString = "";
    let text = [textInput];
    let textInputs = [];

    for(let i in text) {
      if(text[i] === '\u200a') {
        textInputs.push(subString);
        subString = text[i];
      } else if(text[i] === '\u200b') {
        subString += text[i];
        textInputs.push(subString);
        subString = "";
      } else {
        subString += text[i];
      }
    }

    subString != "" ? textInputs.push(subString) : null;

    setTextComponents(textInputs);
  }, []);

  return (
    <LinkableText
      style={{
        flex: 1,
      }}
      textStyle={{
        paddingTop: 4,
        paddingBottom: 16,
        marginLeft: 22,
        maxWidth: Dimensions.get("window").width - 90,
      }}
      urlPreview={item.urlPreview}
    >
      {textComponents?.map((textInput) => textInput.includes('\u200a') ? <Text onPress = {() => findTaggedUser(textInput)} style={{color: "blue"}}>{textInput}</Text> : <Text>{textInput}</Text>)}
    </LinkableText>
  );
};