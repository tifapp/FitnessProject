import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
} from "react-native";
import { Cache, Storage } from "aws-amplify";
import { API, graphqlOperation } from "aws-amplify";
import { getUser } from "../src/graphql/queries";
import { useNavigation } from "@react-navigation/native";

var styles = require("../styles/stylesheet");

//currently the predicted behavior is that it will cache images but the links will be invalid after 1 day. let's see.

export const ProfileImageAndName = (props) => {
  //user is required in props. it's a type of object described in userschema.graphql
  const navigation = props.navigationObject ?? useNavigation();

  const goToProfile = () => {
    if (props.navigateToProfile == false) {
      if (props.you)
        navigation.navigate("Profile", {
          screen: "Profile",
          params: { fromLookup: true },
        });
      else navigation.navigate("Image", { uri: userInfo.imageURL });
    } else {
      if (!navigation.push)
        navigation.navigate("Lookup", { userId: props.userId });
      else navigation.push("Lookup", { userId: props.userId });
    }
  };

  const [userInfo, setUserInfo] = useState(null);
  const [imageChanged, setImageChanged] = useState(true);

  const addUserInfotoCache = () => {
    //console.log('cache missed!', props.userId); //this isn't printing for some reason
    API.graphql(graphqlOperation(getUser, { id: props.userId })).then((u) => {
      const user = u.data.getUser;
      if (user != null) {
        const info = {
          name: user.name,
          imageURL: "",
          isFull: props.isFull,
          changed: false,
        };
        Cache.setItem(props.userId, info, {
          expires: Date.now() + 86400000,
        });
        setUserInfo(info);
        console.log("adding name to cache")
        if (props.callback) props.callback(info); 
        let imageKey = `thumbnails/${user.identityId}/thumbnail-profileimage.jpg`;
        let imageConfig = {
          expires: 86400,
        };
        if (props.isFull) {
          imageKey = "profileimage.jpg";
          imageConfig.identityId = user.identityId;
          imageConfig.level = "protected";
        }
        //console.log("showing full image");
        Storage.get(imageKey, imageConfig) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
          .then((imageURL) => {
            Image.getSize(
              imageURL,
              () => {
                //if (mounted) {
                info.imageURL = imageURL;
                Cache.setItem(props.userId, info);
                setUserInfo(info);
                console.log("adding photo to cache")
                //}
              },
              (err) => {
                //console.log("couldn't find user's profile image");
                Cache.setItem(props.userId, info);
                setUserInfo(info);
                console.log("adding photo to cache")
              }
            );
          })
          .catch((err) => {
            console.log("could not find image!", err);
          }); //should just use a "profilepic" component
      }
    });
    return null;
  };

  useEffect(() => {
    Cache.getItem(props.userId, { callback: addUserInfotoCache }) //we'll check if this user's profile image url was stored in the cache, if not we'll look for it
      .then((info) => {
        console.log("info is ", info)
        if (info != null) {
          if (
            props.isFull &&
            !info.isFull &&
            info.imageURL !== ""
          ) {
            addUserInfotoCache();
          } else {
            setUserInfo(info);
          }
        }
      }); //redundant???
  }, []);

  // useEffect(() => {
  //   Cache.getItem(props.userId) //we'll check if this user's profile image url was stored in the cache, if not we'll look for it
  //     .then((info) => {
  //       if (
  //         userInfo != null &&
  //         info != null &&
  //         userInfo.imageURL !== info.imageURL
  //       ) {
  //         setImageChanged(true);
  //       }
  //     });
  // });

  if (userInfo == null) {
    return (
    <View
      style={[
        {
          flexDirection: props.vertical ? "column" : "row",
          alignItems: "center",
          alignContent: "flex-start",
          justifyContent: "flex-start",
        },
        props.style,
      ]}
    >
      <Image
        style={[props.imageStyle, { margin: 15 }]}
        source={require("../assets/icon.png")}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#0000ff" />
      </View>
    </View>
    );
  } else if (props.hideall) {
    return null;
  } else {
    return (
      <View
        style={[
          {
            flexDirection: props.vertical ? "column" : "row",
            alignItems: "center",
            alignContent: "flex-start",
            justifyContent: "flex-start",
          },
          props.style,
        ]}
      >
        <TouchableOpacity
          onPress={goToProfile}
          style={[{ margin: 15 }, props.imageLayoutStyle]}
        >
          <Image
            onError={addUserInfotoCache}
            style={[props.imageStyle]}
            source={
              userInfo.imageURL === ""
                ? require("../assets/icon.png")
                : { uri: userInfo.imageURL }
            }
          />
          {props.imageOverlay}
        </TouchableOpacity>
        <View style={props.textLayoutStyle}>
          {props.hidename ? null : (
              <Text
                onPress={goToProfile}
                style={[props.textStyle, { flexWrap: "wrap", flexShrink: 1 }]}
              >
                {props.isFull || userInfo.name.length <= 40
                  ? userInfo.name
                  : userInfo.name.substring(0, 40)}
              </Text>
          )}
          {props.subtitleComponent}
        </View>
        {props.sibling}
      </View>
    );
  }
};