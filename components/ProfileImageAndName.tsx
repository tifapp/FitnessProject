import { MaterialIcons } from "@expo/vector-icons";
import fetchUserAsync from "@hooks/fetchName";
import fetchProfileImageAsync from "@hooks/fetchProfileImage";
import StatusColors from "@hooks/statusColors";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image, ImageStyle, StyleProp,
  Text, TextStyle, TouchableOpacity,
  View,
  ViewStyle
} from "react-native";

globalThis.savedUsers = {};
interface Props {
  userId?: string;
  isFullSize?: boolean;
  hideAll?: boolean;
  hideName?: boolean;
  vertical?: boolean;
  spaceAfterName?: boolean;
  nameComponent?: React.ReactNode;
  subtitleComponent?: React.ReactNode;
  imageOverlay?: React.ReactNode;
  onPress?: (imageURL?: string | null) => void;
  imageSize?: number;
  imageStyle?: StyleProp<ImageStyle>;
  navigationObject?: any;
  margin?: number;
  style?: StyleProp<ViewStyle>;
  textLayoutStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const component = ({
  userId = globalThis.myId,
  isFullSize,
  hideAll,
  hideName,
  nameComponent,
  subtitleComponent,
  imageOverlay,
  textLayoutStyle,
  textStyle,
  vertical,
  onPress,
  imageSize,
  imageStyle,
  navigationObject,
  margin,
  style,
  spaceAfterName,
}: Props) => {
  const [userInfo, setUserInfo] = useState<typeof globalThis.savedUsers[keyof typeof globalThis.savedUsers]>();

  useEffect(() => {    
    if (
      !globalThis.savedUsers?.[userId] ||
      (!!isFullSize && !globalThis.savedUsers?.[userId]?.isFullSize)
    ) {
      (async () => {
        try {
          const { name, identityId } = await fetchUserAsync(
            userId
          );
          const profileimageurl = await fetchProfileImageAsync(
            identityId,
            isFullSize
          );

          Image.getSize(
            profileimageurl,
            () => {
              //if (mounted) {
              globalThis.savedUsers[userId] = {
                ...globalThis.savedUsers[userId],
                imageURL: profileimageurl,
                isFullSize,
              };
              //console.log("saved profileimageandname to local cache, should update")
              //will this trigger the second use effect or will we have to do this again?
              setUserInfo(globalThis.savedUsers[userId]);
              //}
            },
            (err) => {
              //console.log("couldn't find user's profile image");
              globalThis.savedUsers[userId] = {
                ...globalThis.savedUsers[userId],
                imageURL: "",
                isFullSize,
              }; //use DPI to figure out what resolution we should save at
              //console.log("saved profileimageandname to local cache, should update")
              //will this trigger the second use effect or will we have to do this again?
              setUserInfo(globalThis.savedUsers[userId]);
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
    setUserInfo(globalThis.savedUsers?.[userId]);
  }, [globalThis.savedUsers?.[userId]]);

  const navigation = navigationObject ?? useNavigation();

  const goToProfile = () => {
    if (globalThis.myId === userId) navigation.navigate("Profile");
    else if (navigation.push) navigation.push("Lookup", { userId: userId });
    else navigation.navigate("Lookup", { userId: userId });
  };

  if (hideAll) {
    return null;
  } else {
    return (
      <TouchableOpacity
        style={[
          {
            flexDirection: vertical ? "column" : "row",
            justifyContent: "flex-start",
            alignItems: "stretch",
          },
          style,
        ]}
        onPress={
          onPress
            ? () => {
                onPress(userInfo?.imageURL);
              }
            : goToProfile
        }
      >
        <Image
          style={[
            {
              // onError={addUserInfotoCache}
              resizeMode: "cover",
              width: imageSize ?? 45,
              height: imageSize ?? 45,
              marginRight: !vertical ? margin ?? 15 : 0,
              marginBottom: vertical ? margin ?? 15 : 0,
              alignSelf: "flex-start",
            },
            imageStyle,
          ]}
          source={
            userInfo == null || userInfo.imageURL === ""
              ? require("../assets/icon.png")
              : { uri: userInfo.imageURL }
          }
        />
        {imageOverlay}
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
        {hideName ? null : (
          <View
            style={[
              { justifyContent: "center"},
              vertical ? { alignItems: "center" } : {},
              textLayoutStyle,
            ]}
          >
            {
              //instead we may consider replacing this whole section with an optional component that takes in the user's name as an argument/prop. the default behavior would be a simple text component.
            }
            <Text
              onPress={
                onPress
                  ? () => {
                      onPress(userInfo?.imageURL);
                    }
                  : goToProfile
              }
              style={[textStyle, { flexWrap: "wrap" }]}
            >
              {!isFullSize && userInfo && userInfo.status ? (
                <MaterialIcons
                  name={userInfo.isVerified ? "check-circle" : "circle"}
                  size={10}
                  color={
                    userInfo.isVerified
                      ? "black"
                      : StatusColors[userInfo.status as keyof typeof StatusColors]
                  }
                />
              ) : null}
              {!isFullSize && userInfo && userInfo.status ? " " : null}
              {userInfo != null && userInfo.name
                ? userInfo.isFullSize || userInfo.name.length <= 40
                  ? userInfo.name + (spaceAfterName ? " " : "")
                  : userInfo.name.substring(0, 40)
                : "Loading..."}
              {nameComponent}
            </Text>
            {subtitleComponent}
          </View>
        )}
      </TouchableOpacity>
    );
  }
}

export const ProfileImageAndName = React.memo(component);
