import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

// @ts-ignore
var styles = require("styles/stylesheet");

const ComplianceScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text
        style={{
          textAlign: "center",
          //padding: 40,
          fontWeight: "bold",
          lineHeight: 30,
        }}
      >
        By continuing, you agree to our {"\n"}
        <Text
          style={{ color: "orange" }}
          onPress={() =>
            Linking.openURL(
              "https://drive.google.com/file/d/15OG-z9vZ97eNWHKooDrBEtV51Yz2fMRQ/view?usp=sharing"
            )
          }
        >
          Terms of Service,{" "}
        </Text>
        <Text
          style={{ color: "orange" }}
          onPress={() =>
            Linking.openURL(
              "https://drive.google.com/file/d/11wIw9yQcT_mHHDT_xflVxEzzEUfh3KgN/view?usp=sharing"
            )
          }
        >
          Privacy Policy, {"\n"}
        </Text>
        <Text
          style={{ color: "orange" }}
          onPress={() =>
            Linking.openURL(
              "https://drive.google.com/file/d/13VlxdknD3xSVdqMFHpV3ADXfmEql_NP6/view?usp=sharing"
            )
          }
        >
          Community Standards,{" "}
        </Text>
        <Text
          style={{ color: "orange" }}
          onPress={() =>
            Linking.openURL(
              "https://drive.google.com/file/d/1aZ0oiThB4vBztSdmemN8p97L3gxcS302/view?usp=sharing"
            )
          }
        >
          and Disclaimers.
        </Text>
      </Text>
      <TouchableOpacity
        style={[styles.buttonStyle, { marginTop: 20 }]}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.buttonTextStyle}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ComplianceScreen;
