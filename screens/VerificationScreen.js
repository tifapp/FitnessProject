import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, Animated, Image, Linking, Platform, TextInput, Keyboard, SafeAreaView } from 'react-native';
import { Auth, API, graphqlOperation, Cache, Storage } from "aws-amplify";
import {
  createVerification,
  updateVerification
} from "root/src/graphql/mutations";
import {
  getVerification,
} from "root/src/graphql/queries";
import SHA256 from "hooks/hash";

import * as DocumentPicker from 'expo-document-picker';

/*onPress={() => Linking.openURL(
                fileURL.value
              )}
*/

var styles = require('styles/stylesheet');

var allSettled = require('promise.allsettled');

const VerificationScreen = ({ navigation, route }) => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState();
  const [files, setFiles] = useState([]);
  const [pendingVerification, setPendingVerification] = useState();
  
  const getFilesAsync = async (id) => {
    const directory = `verification/${id}/`; //later on change this to be in a folder only admins and the requester can access

    const results = await Storage.list(directory);

    console.log(directory);
    console.log(results);

    return await allSettled(results.map(async (value) => {
      return Storage.get(value.key);
    }
    ));
  }

  const uploadDocument = useCallback(async () => {
    setIsUploading(true);

    const result = await DocumentPicker.getDocumentAsync();

    if (result.type === "success") {
      const response = await fetch(result.uri);
      blob = await response.blob();

      const re = /(?:\.([^.]+))?$/;
      const extension = re.exec(result.uri)[1];

      setProgress(0.01);
      try {
        const result = await Storage.put(`verification/${route.params?.myId}/${Date.now()}.${extension}`, blob, { //we may have to deal with people spamming requests after being denied
          progressCallback(progress) {
            setProgress(progress.loaded / progress.total);
          },
          level: 'public'
        });
        files.push({value: result});
      } catch (e) {
        console.log(e);
      }
      setProgress(0);
    }

    setIsUploading(false);
  }, []);

  useEffect(() => {
    (async() => {
      const pending = await API.graphql(
        graphqlOperation(getVerification, { id: route.params?.myId })
      )
      setPendingVerification(pending.data.getVerification);
      const files = await getFilesAsync(route.params?.myId);
      setFiles(files);
    })();
  }, [])

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
          style={{ padding: 15, fontSize: 16 }}>
          {
            pendingVerification ? "Your verification request is pending. Change your requested title or submit more supporting documents here."
              : "You need to be verified in order to become a Health Professional. Upload supporting documents here."
          }
        </Text>
        <View style={{ flexDirection: "column" }}>
          <Text
            style={{ padding: 15, fontSize: 16 }}>
            Your Preferred Title:
          </Text>
          <TextInput
            placeholder={"Please enter your preferred title here."}
            value={title}
            onChangeText={setTitle}
            style={{ fontSize: 16, fontWeight: "normal", color: "black", fontWeight: "bold", alignSelf: "center", textDecorationLine: "underline" }} />
        </View>
        <Text
          style={{ padding: 15, fontSize: 16 }}>
          Documents:
        </Text>

        {
          files.map((fileURL, index) => {
            return <Text
              key={fileURL.value}
              style={{fontSize: 16, padding: 15, paddingTop: 0, alignSelf: "center"}}
              >
              Document {index + 1}
            </Text>
          })
        }

        <TouchableOpacity
          onPress={
            uploadDocument
          }
          disabled={
            isUploading
          }
        >
          <Text
            style={{ padding: 15, fontSize: 18, fontWeight: "normal", color: "blue", alignSelf: "center" }}>
            Upload
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={
            async () => {              
              if (title) {
                try {
                  await API.graphql(
                    graphqlOperation(pendingVerification ? updateVerification : createVerification, { input: { id: route.params?.myId, title: title ?? "Health Professional" } })
                  )
                  setPendingVerification({ id: route.params?.myId, title: title ?? "Health Professional" });
                } catch(e) {
                  alert(e)
                }
              } else {
                alert("Please enter your preferred title!")
              }
            }
          }
          disabled={
            isUploading
          }
        >
          <Text
            style={{ padding: 15, fontSize: 18, fontWeight: "bold", color: "blue", alignSelf: "center" }}>
            Submit
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