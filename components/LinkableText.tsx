import RNUrlPreview from "@components/RNUrlPreview";
import React from "react";
import { Alert, Linking, Text, View, ViewProps } from "react-native";
import Hyperlink from "react-native-hyperlink";

interface Props extends ViewProps {
  textStyle: string,
  urlPreview: string
}

export default function LinkableText({ children, style, textStyle, urlPreview } : Props) {
  const warnExternalSite = (url: string, text: string) => {
    const title =
      "This link will take you to an external site (" +
      url +
      "). Do you want to continue?";
    const options = [
      {
        text: "Yes",
        onPress: () => {
          Linking.openURL(url);
        },
      },
      {
        text: "Cancel",
        type: "cancel",
      },
    ];
    Alert.alert(title, "", options);
  };

  //console.log("the url we're passing to preview is ", props.urlPreview)

  if (children) {
    return (
      <View style={style}>
        <View>
          { // Replace the Hyperlink component with a different component 10/17/2022 
            /*@ts-ignore */}
          <Hyperlink
            linkStyle={{ color: "#0000ff" }}
            onPress={warnExternalSite}
          >
            <Text
              style={[
                {
                  fontSize: 16,
                },
                textStyle,
              ]}
            >
              {children}
            </Text>
          </Hyperlink>
        </View>
        <RNUrlPreview
          urlPreview={urlPreview}
          descriptionNumberOfLines={2}
          onPress={warnExternalSite}
        />
      </View>
    );
  } else return null;
}
