import RNUrlPreview from "components/RNUrlPreview";
import React from "react";
import { Alert, Linking, Text, View } from "react-native";
import Hyperlink from "react-native-hyperlink";

export default function LinkableText(props) {
  const warnExternalSite = (url, text) => {
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

  if (props.children) {
    return (
      <View style={props.style}>
        <View>
          <Hyperlink
            linkStyle={{ color: "#0000ff" }}
            onPress={warnExternalSite}
          >
            <Text
              style={[
                {
                  fontSize: 16,
                },
                props.textStyle,
              ]}
            >
              {props.children}
            </Text>
          </Hyperlink>
        </View>
        <RNUrlPreview
          urlPreview={props.urlPreview}
          descriptionNumberOfLines={2}
          onPress={warnExternalSite}
        />
      </View>
    );
  } else return null;
}
