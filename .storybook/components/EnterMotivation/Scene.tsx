import { useSound } from "@lib/Audio";
import { useHaptics } from "@modules/tif-haptics";
import React, { useRef, useState } from "react";
import {
  Keyboard,
  Text,
  TextInput,
  View
} from "react-native";
import { ColorString } from "TiFShared/domain-models/ColorString";
import { Title } from "../../../components/Text";
import { FadeOut } from "../FadeOut/FadeOut";
import { Mountain } from "../Icons/Mountain";
import { useFade } from "../Interpolate";
import { Avatar, AvatarRef } from "./Avatar";

const AvatarRow = ({ avatarCount, color, avatarRef }: { avatarCount: number, color: ColorString, avatarRef: any }) => {
  // Split the number of avatars into two parts: before and after the middle avatar
  const middleIndex = Math.floor(avatarCount / 2);
  const backRowCount = avatarCount + 1; // Back row has +1 more avatar than the front row

  const renderAvatars = () => {
    let avatars = [];

    // Render avatars before the middle one
    for (let i = 0; i < middleIndex; i++) {
      avatars.push(
        <Avatar
          key={`before-${i}`}
          color={color}
          rotation={Math.random() * -5 + (Math.random() > 0.5 ? -75 : 75)}
        />
      );
    }

    // Add the middle avatar with the ref passed from the parent
    avatars.push(
      <Avatar
        key="middle"
        color={color}
        rotation={-75}
        ref={avatarRef}
      />
    );

    // Render avatars after the middle one
    for (let i = middleIndex + 1; i < avatarCount; i++) {
      avatars.push(
        <Avatar
          key={`after-${i}`}
          color={color}
          rotation={Math.random() * -5 + (Math.random() > 0.5 ? -75 : 75)}
        />
      );
    }

    return avatars;
  };

  const renderBackRowAvatars = () => {
    let backAvatars = [];

    for (let i = 0; i < backRowCount; i++) {
      backAvatars.push(
        <Avatar
          key={`back-${i}`}
          color={color}
          rotation={Math.random() * -5 + (Math.random() > 0.5 ? -75 : 75)}
        />
      );
    }

    return backAvatars;
  };

  return (
    <View style={[styles.avatarContainer, {paddingLeft: 690, zIndex: 5}]}>
      {/* Back row with opacity for depth */}
      <View
        style={[
          styles.avatarContainer,
          {
            position: "absolute",
            opacity: 0.1,
            gap: 75,
            left: -110,
          },
        ]}
      >
        {renderBackRowAvatars()}
      </View>

      {/* Main row of avatars */}
      {renderAvatars()}
    </View>
  );
};

const MIN_ZOOM = 0.4
const MAX_ZOOM = 1

export const EnterMotivationScene = ({ color, goal, onComplete, onStand }: { color: ColorString, goal: string, onComplete: (text: string) => void, onStand: () => void }) => {
  const placeholderText = `I will be a ${goal}.`;
  
  const {sound} = useSound(require('../../assets/wind.mp3'));
  const haptics = useHaptics();
  const [finished, setFinished] = useState(false);
  const [text, setText] = useState("");
  const avatarRef = useRef<AvatarRef>(null);
  const [zoomLevel, setZoomLevel] = useState(MIN_ZOOM);
  const [showWarning, setShowWarning] = useState(false);
  
  const {fadeIn, fadeOut} = useFade(1, sound?.setVolumeAsync ?? (() => {}))

  const handleChangeText = (newText: string) => {
    newText = newText.replace(/\n/g, '');
    setShowWarning(false);
    setText(newText);
    const spacesTyped = (newText.match(/ /g) || []).length;
    const maxSpaces = 4;
    if (placeholderText.startsWith(newText)) {
      const newZoomLevel = MIN_ZOOM + ((spacesTyped / maxSpaces) * (MAX_ZOOM - MIN_ZOOM));
      if (newZoomLevel > zoomLevel) {
        haptics.playHeartbeat()
      }
      setZoomLevel(newZoomLevel);

      const minVolume = 0.5;
      const maxVolume = 1;
      const newVolume = maxVolume - ((newZoomLevel - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * (maxVolume - minVolume);
      sound?.setVolumeAsync(newVolume);

      if (newText.length > text.length) {
        avatarRef.current?.pulse();
      }
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter') {
      if (text.trim() === placeholderText.trim()) {
        avatarRef.current?.standUp();
        haptics.playRoar();
        fadeOut();
        setFinished(true);
        onStand?.();
        Keyboard.dismiss();
      }
    }
  };

  const rowHeight = 40;

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Are you sure you will become a {goal}?</Title>

      <View
        style={{
          transform: [
            { translateY: rowHeight * (1 - zoomLevel) },
            { scale: zoomLevel },
          ],
          alignItems: "center",
        }}
      >
        <View style={{position: "absolute", bottom: 200, opacity: 0.3, zIndex: -10}}>
        <Mountain height={900} width={900} />
        </View>
        <AvatarRow avatarRef={avatarRef} color={color} avatarCount={7} />
      </View>
      <View style={styles.separator} />

      <View style={styles.inputWrapper}>
        <Text style={styles.placeholderText}>{placeholderText}</Text>
        <TextInput
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          style={[
            styles.textField,
            showWarning && styles.warningBorder,
          ]}
          autoFocus
          multiline={true}
          value={text}
          onChangeText={handleChangeText}
          returnKeyType="go"
          onKeyPress={handleKeyPress}
        />
      </View>

      <FadeOut
        trigger={finished}
        onComplete={() => {
          sound?.stopAsync();
          onComplete(text);
        }}
        delay={2000}
      />
    </View>
  );
};


