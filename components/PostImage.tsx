import { Storage } from "aws-amplify"
import { Video } from "expo-av"
import React, { useEffect, useRef, useState } from "react"
import { ImageBackground, ImageStyle, StyleProp } from "react-native"

interface Props {filename?: string | null, style: StyleProp<ImageStyle>, isVisible: boolean}

const re = /(?:\.([^.]+))?$/

export default function PostImage ({ style, filename, isVisible }: Props) {
  const [fullImageURL, setFullImageURL] = useState<string | null>()
  const video = useRef<Video>(null)

  const imageKey = `feed/${filename}`
  const imageConfig = {
    expires: 86400
  }

  useEffect(() => {
    console.log("image id is ", filename)
    if (filename) {
      Storage.get(imageKey, imageConfig) // this will incur lots of repeated calls to the backend, idk how else to fix it right now
        .then((imageURL) => {
          setFullImageURL(imageURL as string)
        })
        .catch((err) => {
          console.log("could not find image!", err)
          setFullImageURL(null)
        }) // should just use a "profilepic" component
    }
  }, [])

  useEffect(() => {
    if (video.current) {
      if (globalThis.currentVideo !== fullImageURL) {
        video.current.pauseAsync()
      }
    }
  }, [globalThis.currentVideo])

  useEffect(() => {
    if (video.current) {
      if (isVisible === true) {
        video.current.playAsync()
        globalThis.currentVideo = fullImageURL
      } else if (isVisible === false) {
        video.current.pauseAsync()
        if (global.currentVideo === fullImageURL) {
          globalThis.currentVideo = null
        }
      }
    }
  }, [isVisible])

  if (filename) {
    return re.exec(filename)?.[1] === "jpg"
      ? (
      <ImageBackground
        style={style}
        source={
          fullImageURL == null || fullImageURL === ""
            ? require("../assets/icon.png")
            : { uri: fullImageURL }
        }
      />
        )
      : (
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
                positionMillis: 0
              })
            }
          })()
        }}
      />
        )
  } else return null
}
