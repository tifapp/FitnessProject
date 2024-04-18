import React, { SetStateAction } from "react"
import { Title } from "@components/Text"
import { TouchableIonicon } from "@components/common/Icons"
import { EventCard } from "@event/EventCard"
import { AppStyles } from "@lib/AppColorStyle"
import { ClientSideEvent } from "@event/ClientSideEvent"
import { FlatList, ListRenderItemInfo, Modal, StyleSheet } from "react-native"

interface Props {
  username: string
  visible: boolean
  setVisible: React.Dispatch<SetStateAction<boolean>>
  events: ClientSideEvent[]
}

const MARGIN_HORIZONTAL = 16
const MARGIN_VERTICAL = 16

const EventHistoryModal = ({
  username,
  visible,
  setVisible,
  events
}: Props) => {
  return (
    <Modal style={styles.container} visible={visible} animationType="slide">
      <TouchableIonicon
        icon={{ name: "close", color: AppStyles.darkColor }}
        style={styles.iconStyle}
        onPress={() => {
          setVisible(false)
        }}
      />
      <Title style={styles.eventSpacing}>{`${username}'s\nEvents`}</Title>
      <FlatList
        data={events}
        renderItem={({ item }: ListRenderItemInfo<ClientSideEvent>) => (
          <EventCard event={item} style={styles.eventSpacing} />
        )}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 0,
    backgroundColor: "white"
  },
  eventSpacing: {
    marginHorizontal: MARGIN_HORIZONTAL,
    marginVertical: MARGIN_VERTICAL
  },
  iconStyle: {
    alignSelf: "flex-end",
    backgroundColor: AppStyles.colorOpacity35,
    borderRadius: 20,
    marginRight: 16
  }
})

export default EventHistoryModal
