import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Animated, Image, Linking, Platform, TextInput, Keyboard, SafeAreaView } from 'react-native';
import { Auth, API, graphqlOperation, Cache, Storage } from "aws-amplify";
import {
  createVerification,
} from "root/src/graphql/mutations";
import SHA256 from "hooks/hash";

import * as DocumentPicker from 'expo-document-picker';

var styles = require('styles/stylesheet');

const VerificationScreen = ({ navigation, route }) => {
    const [progress, setProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const uploadDocument = useCallback(async () => {
        setIsUploading(true);

        console.log("JFAWPEOIFJ")

        const result = await DocumentPicker.getDocumentAsync();

        if (result.type === "success") {
            const response = await fetch(result.uri);
            blob = await response.blob();

            setProgress(0.01);
            try {
                await Storage.put(`verification/${route.params?.myId}/${Date.now()}`, blob, { //we may have to deal with people spamming requests after being denied
                    progressCallback(progress) {
                        setProgress(progress.loaded / progress.total);
                    },
                    level: 'public'
                });
                await API.graphql(
                  graphqlOperation(createVerification, { input: { id: route.params?.myId } })
                );
            } catch (e) {
                console.log(e);
            }
            setProgress(0);
        }

        setIsUploading(false);
    }, []);
    
  let animation = useRef(new Animated.Value(0));
  useEffect(() => {
    Animated.timing(animation.current, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false // Add This line
    }).start();
  }, [progress])

  const width = animation.current.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp"
  })

    return (
        <ScrollView style={[styles.containerStyle, { backgroundColor: "#efefef" }]} >
            <SafeAreaView>
                <Text
                style={{padding: 15, fontSize: 16}}>
                    You need to be verified in order to become a Health Professional.
                    Upload supporting documents here.
                </Text>
                <TouchableOpacity
                onPress={
                    uploadDocument
                }
                disabled={
                    isUploading
                }
                >
                    <Text
                    style={{padding: 15, fontSize: 18, fontWeight: "bold", color: "blue", alignSelf: "center"}}>
                        Upload
                    </Text>
                </TouchableOpacity>
                {
                    isUploading
                    ? <ActivityIndicator
                    size="large"
                    color="#000000"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      flexDirection: "row",
                      justifyContent: "space-around",
                      padding: 20,
                    }} />
                    : null
                }
                {
                  progress > 0 ?
                    <View style={{
                      height: 30,
                      backgroundColor: 'white',
                      margin: 15,
                      borderRadius: 5,
                    }}>
                      <Animated.View style={[{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                      }, { backgroundColor: "#26c6a2", width }]} />
                      <Text
                        style={{
                          alignSelf: "center",
                          justifyContent: "center",
                          color: "black",
                          fontWeight: "bold",
                          fontSize: 15,
                          marginTop: 5,
                        }}>
                        Uploading...
                      </Text>
                    </View> : null
                }
            </SafeAreaView>
        </ScrollView>
    )
}

export default VerificationScreen;