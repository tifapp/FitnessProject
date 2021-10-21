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
import { useNavigation } from "@react-navigation/native";
import fetchUserAsync from 'hooks/fetchName';
import fetchProfileImageAsync from 'hooks/fetchProfileImage';

var styles = require("../styles/stylesheet");

global.savedUsers = {};
//objects will look like {name: [name], imageURL: [imageURL]}

export const ProfileImageAndName = React.memo(function (props) {  
  const [userInfo, setUserInfo] = useState(); //an object containing the name and imageurl

  useEffect(() => {
    if (!global.savedUsers[props.userId]) {
      (async() => {
        try {
          const {name, identityId} = await fetchUserAsync(props.userId);
          const profileimageurl = await fetchProfileImageAsync(identityId, props.isFull);

          Image.getSize(
            profileimageurl,
            () => {
              //if (mounted) {
              global.savedUsers[props.userId] = { name: name, imageURL: profileimageurl }
              console.log("saved profileimageandname to local cache, should update")
              //will this trigger the second use effect or will we have to do this again?
              setUserInfo(global.savedUsers[props.userId]);
              //}
            },
            (err) => {
              //console.log("couldn't find user's profile image");
              global.savedUsers[props.userId] = { name: name, imageURL: '' }
              console.log("saved profileimageandname to local cache, should update")
              //will this trigger the second use effect or will we have to do this again?
              setUserInfo(global.savedUsers[props.userId]);
            }
          );
        } catch (e) {
          console.log("couldn't get the user's info of ", e)
        }
      })();
    }
  }, []);

  useEffect(() => {
    //this will also run when the component is first mounted, remember
    if (global.savedUsers[props.userId]) {
      Image.getSize(
        global.savedUsers[props.userId].imageURL,
        () => {
          //console.log("adding photo to cache")
        },
        (err) => {
          //console.log("photo didnt work ", err)
        }
      );
    }
    //console.log("updating profileimageandname")
    setUserInfo(global.savedUsers[props.userId]);
  }, [global.savedUsers[props.userId]])

  const navigation = props.navigationObject ?? useNavigation();

  const goToProfile = () => {
    if (props.you)
      navigation.navigate("Profile");
    else if (navigation.push)
      navigation.push("Lookup", { userId: props.userId });
    else
      navigation.navigate("Lookup", { userId: props.userId });
  };

  if (props.hideall) {
    return null;
  } else {
    return (
      <TouchableOpacity
        style={[
          {
            flexDirection: props.vertical ? "column" : "row",
            justifyContent: "flex-start",
            alignItems: "stretch",
          },
          props.style,
        ]}
        onPress={props.onPress ? () => {props.onPress(userInfo.imageURL)} : goToProfile}
      >
        <Image
          style={[{ // onError={addUserInfotoCache}
            resizeMode: "cover",
            width: props.imageSize ?? 45,
            height: props.imageSize ?? 45,
            marginRight: !props.vertical ? props.margin ?? 15 : 0,
            marginBottom: props.vertical ? props.margin ?? 15 : 0,
            alignSelf: "flex-start",
          }, props.imageStyle]}
          source={
            (userInfo == null || userInfo.imageURL === "") ?
              require("../assets/icon.png")
              : { uri: userInfo.imageURL }
          }
        />
        {props.imageOverlay}
        {
          userInfo == null ?
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100%"
              }}
            >
              <ActivityIndicator color="#26c6a2" />
            </View>
            : null
        }
        {props.hidename ? null : (
          <View style={[{ justifyContent: "space-between" }, props.vertical ? {alignItems: "center"} : {},  props.textLayoutStyle]}>
            <Text
              onPress={props.onPress ? () => {props.onPress(userInfo.imageURL)} : goToProfile}
              style={[props.textStyle, { flexWrap: "wrap", }]}
            >
              {userInfo != null && userInfo.name
                ? userInfo.isFull || userInfo.name.length <= 40
                  ? userInfo.name + (props.spaceAfterName ? " " : "")
                  : userInfo.name.substring(0, 40)
                : "Loading..."}
                {props.nameComponent}
            </Text>
            {props.subtitleComponent}
          </View>
        )}
      </TouchableOpacity>
    );
  }
});