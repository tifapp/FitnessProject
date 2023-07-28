// Get the aws resources configuration parameters
import APIList from "@components/APIList";
import { updateVerification, verifyUser } from "@graphql/mutations";
import { listVerifications } from "@graphql/queries";
import { API, Auth, graphqlOperation, Storage } from "aws-amplify";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Linking,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

var allSettled = require("promise.allsettled");

function VerificationRequestItem({ deleteRequest, item }) {
  const [title, setTitle] = useState(item.title);

  return (
    <View>
      <TextInput
        defaultValue={item.title}
        value={title}
        onChangeText={setTitle}
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "black",
          textDecorationLine: "underline",
        }}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <TouchableOpacity
          onPress={() => deleteRequest(item, true, title)}
          disabled={!title}
        >
          <Text>Accept.</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteRequest(item, false)}>
          <Text>Reject.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function VerificationRequestsScreen() {
  const [requests, setRequests] = useState([]);

  const getFilesAsync = async (id) => {
    const directory = `verification/${id}/`; //later on change this to be in a folder only admins and the requester can access

    const results = await Storage.list(directory);

    console.log(directory);
    console.log(results);

    return await allSettled(
      results.map(async (value) => {
        return Storage.get(value.key);
      })
    );
  };

  const deleteRequest = async (request, approve, title) => {
    if (!request.files) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRequests((requests) => {
      return requests.filter((r) => {
        if (r.files) return r.id !== request.id;
      });
    });

    try {
      if (approve) {
        await API.graphql(
          graphqlOperation(updateVerification, {
            input: { id: request.id, isVerified: true, title: title },
          })
        );
        await API.graphql(
          graphqlOperation(verifyUser, {
            input: { id: request.id, title: title },
          })
        );
      }
    } catch (err) {
      console.log("error in deleting request: ", err);
    }
  };

  const attachFiles = async (newRequests) => {
    const files = await allSettled(
      newRequests.map(async (request) => {
        return getFilesAsync(request.id);
      })
    );

    newRequests.forEach((request, index) => {
      request.files = files[index].value; //amplify connection would probably be good here
    });

    console.log(newRequests);

    return newRequests; //what if there are duplicates?
  };

  async function signOut() {
    Auth.signOut();
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <APIList
        initialAmount={10}
        additionalAmount={20}
        queryOperation={listVerifications}
        data={requests}
        setDataFunction={setRequests}
        ListHeaderComponent={
          <TouchableOpacity onPress={signOut}>
            <Text>Log out</Text>
          </TouchableOpacity>
        }
        renderItem={({ item, index }) => (
          <View style={{ backgroundColor: "white", marginBottom: 15 }}>
            {!item.isVerified ? (
              <VerificationRequestItem
                deleteRequest={deleteRequest}
                item={item}
              />
            ) : null}

            {item.files.map((fileURL, index) => {
              return (
                <Text
                  key={fileURL.value}
                  onPress={() => Linking.openURL(fileURL.value)}
                >
                  Document {index + 1}
                </Text>
              );
            })}
          </View>
        )}
        processingFunction={attachFiles}
        keyExtractor={(item) => item.userId + item.createdAt}
      />
    </SafeAreaView>
  );
}