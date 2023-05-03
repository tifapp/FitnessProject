import React from "react"
import { View } from "react-native"
import { Headline } from "../Text"
import { Ionicons } from "@expo/vector-icons"
import { Ionicon } from "../common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { useAtom, useAtomValue } from "jotai"
import { friendAtom, requestAtom } from "@lib/Jotai"

interface AddFriendProps {
  eventColor: string
}

const AddFriendText = ({eventColor}: AddFriendProps) => {
  const isFriend = useAtomValue(friendAtom)
  const [requestSent, setRequestSent] = useAtom(requestAtom)
  return (
    <>
      {!isFriend && 
        !requestSent ? (
          <View style={[{flexDirection: "row", alignItems: "center" }]}>
            <Ionicon
              style={{ marginHorizontal: 8 }}
              size={6}
              color={AppStyles.colorOpacity35}
              name="ellipse"
            />
            <Headline
              onPress={() => setRequestSent(true)}
              style={{ color: eventColor }}>
                Add Friend
            </Headline>
          </View>
        )
        : (
          <View style={[{flexDirection: "row", alignItems: "center" }]}>
            <Ionicons
              style={{ marginHorizontal: 8 }}
              color={AppStyles.colorOpacity35}
              size={6}
              name="ellipse"
            />
            <Headline
              style={{opacity: 0.35}}
              onPress={() => setRequestSent(true)}>
                Request Sent
            </Headline>
          </View>
        )
      }
    </>
  )
}

export default AddFriendText