import React, { useState, useEffect, useRef, } from "react";
import {
  Text,
  View,
  SafeAreaView,
  LayoutAnimation,
  TouchableOpacity,
  Linking
} from "react-native";
// Get the aws resources configuration parameters
import { API, graphqlOperation, Cache, Auth, Storage } from "aws-amplify";
import { listVerifications } from "root/src/graphql/queries";
import { deleteVerification, updateVerification, verifyUser } from "root/src/graphql/mutations";
import { ProfileImageAndName } from "components/ProfileImageAndName";
import printTime from "hooks/printTime";
import APIList from 'components/APIList';
import PostItem from "components/PostItem";

var styles = require('styles/stylesheet');

var allSettled = require('promise.allsettled');

export default function VerificationRequestsScreen() {
  const [requests, setRequests] = useState([]);
  
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
  
  const deleteRequest = async (request, approve) => {
    if (!request.files) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRequests((requests) => {
      return requests.filter((r) => {if (r.files) return (r.id !== request.id)});
    });

    try {
      if (approve) {
        API.graphql(graphqlOperation(updateVerification, { input: { id: request.id, isVerified: true } }))
        API.graphql(graphqlOperation(verifyUser, { input: { id: request.id } }))
      } else {
        API.graphql(graphqlOperation(deleteVerification, { input: { id: request.id } }));
      }
    } catch (err) {
      console.log("error in deleting request: ", err);
    }
  };

  const attachFiles = async (newRequests) => {
    const files = await allSettled(newRequests.map(async (request) => {
      return getFilesAsync(request.id);
    }
    ));

    newRequests.forEach((request, index) => {
      request.files = files[index].value; //amplify connection would probably be good here
    });

    console.log(newRequests);

    return newRequests; //what if there are duplicates?
  }
  
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
          <TouchableOpacity
            onPress={signOut}
          >
            <Text>
              Log out
            </Text>
          </TouchableOpacity>
        }
        renderItem={({ item, index }) => (
          <View style={{ backgroundColor: "white", marginBottom: 15 }}>

            {
              !item.isVerified ?
                <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                  <TouchableOpacity
                    onPress={() => deleteRequest(item, true)}
                  >
                    <Text>
                      Accept.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteRequest(item, false)}
                  >
                    <Text>
                      Reject.
                    </Text>
                  </TouchableOpacity>
                </View> : null
            }

            {
              item.files.map((fileURL, index) => {return <Text
                  key={fileURL.value}
                  onPress={() => Linking.openURL(
                    fileURL.value
                  )}>
                  Document {index + 1}
                </Text>})
            }
          </View>
        )}
        processingFunction={attachFiles}
        keyExtractor={(item) => item.userId + item.createdAt}
      />
    </SafeAreaView>
  );
};