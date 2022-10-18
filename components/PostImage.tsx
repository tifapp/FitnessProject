import { Storage } from "aws-amplify";
import { Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { ImageBackground, ImageStyle, StyleProp } from "react-native";
import { Post } from "src/models";

interface Props extends Pick<Post, "imageURL"> {style: StyleProp<ImageStyle>, isVisible: boolean}

const re = /(?:\.([^.]+))?$/;

global.currentVideo;


export default function PostImage({ style, imageURL /* Change the imageURL to filename 10/17/2022 */, isVisible }: Props) {
  const [fullImageURL, setFullImageURL] = useState<string | null>();
  const video = useRef<Video>(null);

  let imageKey = `feed/${imageURL}`;
  let imageConfig = {
    expires: 86400,
  };

  useEffect(() => {
    //console.log("image id is ", imageURL);
    if (imageURL) {
      Storage.get(imageKey, imageConfig) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
        .then((imageURL) => {
          setFullImageURL(imageURL as string);
        })
        .catch((err) => {
          console.log("could not find image!", err);
          setFullImageURL(null);
        }); //should just use a "profilepic" component
    }
  }, []);

  useEffect(() => {
    //console.log("image id is ", imageURL);
    if (video.current) {
      if (global.currentVideo !== fullImageURL) {
        video.current.pauseAsync();
      }
    }
  }, [global.currentVideo]);

  useEffect(() => {
    if (video.current) {
      if (isVisible === true) {
        video.current.playAsync();
        global.currentVideo = fullImageURL;
      } else if (isVisible === false) {
        video.current.pauseAsync();
        if (global.currentVideo === fullImageURL) {
          global.currentVideo = null;
        }
      }
    }
  }, [isVisible]);

  if (imageURL) {
    return re.exec(imageURL)?.[1] === "jpg" ? (
      <ImageBackground
        style={style}
        source={
          fullImageURL == null || fullImageURL === ""
            ? require("../assets/icon.png")
            : { uri: fullImageURL }
        }
      />
    ) : (
      <Video
        ref={video}
        style={style}
        source={{ uri: fullImageURL ?? "" }}
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
