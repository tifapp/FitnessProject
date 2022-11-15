import { MaterialIcons } from "@expo/vector-icons";
import fetchUserAsync from "@hooks/fetchName";
import fetchProfileImageAsync from "@hooks/fetchProfileImage";
import StatusColors from "@hooks/statusColors";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// @ts-ignore
global.savedUsers = {}; // Does this global variable get initialized when the app loads or when this component first gets rendered
//objects will look like {name: [name], imageURL: [imageURL], isFullSize: [bool]}

export const ProfileImageAndName = React.memo(function ({userId = globalThis.myId, ...props}) {
  const [userInfo, setUserInfo] = useState(); //an object containing the name and imageurl

  useEffect(() => {
    console.log(
      "are we fetching the full size? ",
      !global.savedUsers[userId] ||
        (!!props.isFullSize && !global.savedUsers[userId].isFullSize)
    );
    if (
      !global.savedUsers[userId] ||
      (!!props.isFullSize && !global.savedUsers[userId].isFullSize)
    ) {
      (async () => {
        try {
          const { name, identityId, status, isVerified } = await fetchUserAsync(
            userId
          );
          const profileimageurl = await fetchProfileImageAsync(
            identityId,
            props.isFullSize
          );

          Image.getSize(
            profileimageurl,
            () => {
              //if (mounted) {
              global.savedUsers[userId] = {
                name: name,
                imageURL: profileimageurl,
                isFullSize: props.isFullSize,
                status: status,
                isVerified: isVerified,
              };
              //console.log("saved profileimageandname to local cache, should update")
              //will this trigger the second use effect or will we have to do this again?
              setUserInfo(global.savedUsers[userId]);
              //}
            },
            (err) => {
              //console.log("couldn't find user's profile image");
              global.savedUsers[userId] = {
                name: name,
                imageURL: "",
                isFullSize: props.isFullSize,
                status: status,
                isVerified: isVerified,
              }; //use DPI to figure out what resolution we should save at
              //console.log("saved profileimageandname to local cache, should update")
              //will this trigger the second use effect or will we have to do this again?
              setUserInfo(global.savedUsers[userId]);
            }
          );
        } catch (e) {
          console.log("couldn't get the user's info of ", e);
        }
      })();
    }
  }, []);

  useEffect(() => {
    //console.log("updating profileimageandname")
    setUserInfo(global.savedUsers[userId]);
  }, [global.savedUsers[userId]]);

  const navigation = props.navigationObject ?? useNavigation();

  const goToProfile = () => {
    if (globalThis.myId === userId) navigation.navigate("Profile");
    else if (navigation.push)
      navigation.push("Lookup", { userId: userId });
    else navigation.navigate("Lookup", { userId: userId });
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
        onPress={
          props.onPress
            ? () => {
                props.onPress(userInfo.imageURL);
              }
            : goToProfile
        }
      >
        <Image
          style={[
            {
              // onError={addUserInfotoCache}
              resizeMode: "cover",
              width: props.imageSize ?? 45,
              height: props.imageSize ?? 45,
              marginRight: !props.vertical ? props.margin ?? 15 : 0,
              marginBottom: props.vertical ? props.margin ?? 15 : 0,
              alignSelf: "flex-start",
            },
            props.imageStyle,
          ]}
          source={
            userInfo == null || userInfo.imageURL === ""
              ? require("../assets/icon.png")
              : { uri: userInfo.imageURL }
          }
        />
        {props.imageOverlay}
        {userInfo == null ? (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <ActivityIndicator color="#26c6a2" />
          </View>
        ) : null}
        {props.hidename ? null : (
          <View
            style={[
              { justifyContent: "space-between" },
              props.vertical ? { alignItems: "center" } : {},
              props.textLayoutStyle,
            ]}
          >
            <Text
              onPress={
                props.onPress
                  ? () => {
                      props.onPress(userInfo.imageURL);
                    }
                  : goToProfile
              }
              style={[props.textStyle, { flexWrap: "wrap" }]}
            >
              {!props.isFullSize && userInfo && userInfo.status ? (
                <MaterialIcons
                  name={userInfo.isVerified ? "check-circle" : "circle"}
                  size={10}
                  color={
                    userInfo.isVerified
                      ? "black"
                      : StatusColors[userInfo.status]
                  }
                />
              ) : null}
              {!props.isFullSize && userInfo && userInfo.status ? " " : null}
              {userInfo != null && userInfo.name
                ? userInfo.isFullSize || userInfo.name.length <= 40
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
