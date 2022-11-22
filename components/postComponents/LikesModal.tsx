import ElevatedView from "@components/common/ElevatedView";
import IconButton from "@components/common/IconButton";
import LikesList from "@components/LikesList";
import React from "react";
import { View } from "react-native";

interface Props {
  item: {userId: string, createdAt: string}
}

export default function LikesModal({ item } : Props) {
  return (
    <>
      <ElevatedView
        style={{
          position: "absolute",
          top: -18,
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <View
          style={{
            backgroundColor: "red",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <IconButton
            style={{
              backgroundColor: "red",
              flexDirection: "row",
              alignItems: "center",
            }}
            size={17}
            color="white"
            iconName="favorite"
            fontWeight="bold"
            label="Liked by"
          />
        </View>
      </ElevatedView>
      <LikesList postId={item.createdAt + "#" + item.userId} />
    </>
  );
}
