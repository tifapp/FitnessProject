import { Storage } from "aws-amplify";
import { Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { ImageBackground, StyleProp, ViewStyle } from "react-native";

interface Props {style: StyleProp<ViewStyle>, imageID: string, isVisible: boolean}

const re = /(?:\.([^.]+))?$/;

global.currentVideo;

export default function PostImage({ style, imageID, isVisible }: Props) {
  const [imageURL, setImageURL] = useState<string | null>();
  const video = useRef<Video>(null);

  let imageKey = `feed/${imageID}`;
  let imageConfig = {
    expires: 86400,
  };

  useEffect(() => {
    //console.log("image id is ", imageID);
    if (imageID) {
      Storage.get(imageKey, imageConfig) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
        .then((imageURL) => {
          setImageURL(imageURL as string);
        })
        .catch((err) => {
          console.log("could not find image!", err);
          setImageURL(null);
        }); //should just use a "profilepic" component
    }
  }, []);

  useEffect(() => {
    //console.log("image id is ", imageID);
    if (video.current) {
      if (global.currentVideo !== imageURL) {
        video.current.pauseAsync();
      }
    }
  }, [global.currentVideo]);

  useEffect(() => {
    if (video.current) {
      if (isVisible === true) {
        video.current.playAsync();
        global.currentVideo = imageURL;
      } else if (isVisible === false) {
        video.current.pauseAsync();
        if (global.currentVideo === imageURL) {
          global.currentVideo = null;
        }
      }
    }
  }, [isVisible]);

  if (imageID) {
    return re.exec(imageID)?.[1] === "jpg" ? (
      <ImageBackground
        style={style}
        source={
          imageURL == null || imageURL === ""
            ? require("../assets/icon.png")
            : { uri: imageURL }
        }
      />
    ) : (
      <Video
        ref={video}
        style={style}
        source={{ uri: imageURL ?? "" }}
        posterSource={require("../assets/icon.png")}
        useNativeControls
        onPlaybackStatusUpdate={(status) => {
          (async () => {
            if (status.isLoaded && status.didJustFinish) {
              video.current?.setStatusAsync({
                shouldPlay: false,
                positionMillis: 0,
              });
            }
          })();
        }}
      />
    );
  } else return null;
}
