import React, { useState, useEffect, useRef } from "react";
import {
  Image, ImageBackground,
} from "react-native";
import { Storage } from "aws-amplify";
import { Video, AVPlaybackStatus } from 'expo-av';

const re = /(?:\.([^.]+))?$/;

export default function PostImage({style, imageID, isVisible}) {
  const [imageURL, setImageURL] = useState(null);
  const video = useRef(null);
  
  let imageKey = `feed/${imageID}`;
  let imageConfig = {
    expires: 86400,
  };

  useEffect(() => {
    //console.log("image id is ", imageID);
    if (imageID) {
      Storage.get(imageKey, imageConfig) //this will incur lots of repeated calls to the backend, idk how else to fix it right now
        .then((imageURL) => {
          setImageURL(imageURL);
        })
        .catch((err) => {
          console.log("could not find image!", err);
          setImageURL(null);
        }); //should just use a "profilepic" component
    }
  }, [])

  useEffect(() => {
    if (video.current) {
      if (isVisible === true) {
        video.current.playAsync();
      } else if (isVisible === false) {
        video.current.pauseAsync();
      }
    }
  }, [isVisible])

  if (imageID) {
    return (
      (re.exec(imageID)[1] === 'jpg') ?
        <ImageBackground
          style={style}
          source={
            (imageURL == null || imageURL === "") ?
              require("../assets/icon.png")
              : { uri: imageURL }
          }
        /> : <Video
          ref={video}
          style={style}
          source={{ uri: imageURL }}
          posterSource={require("../assets/icon.png")}
          useNativeControls
          isLooping
        />
    )
  } else return null;
}