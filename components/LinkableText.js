import React, { useState, useEffect, useRef, PureComponent } from "react";
import Hyperlink from "react-native-hyperlink";
import RNUrlPreview from "components/RNUrlPreview";
import {
  StyleSheet,
  View,
  Button,
  Image,
  TextInput,
  Text,
  TouchableOpacity,
  Linking,
  LayoutAnimation,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Dimensions
} from "react-native";

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
  
    return (
      <View>
        <View style={props.style}>
          <Hyperlink linkStyle={{ color: "#2980b9" }} onPress={warnExternalSite}>
            <Text
              style={{
                fontSize: 16,
              }}
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
  }