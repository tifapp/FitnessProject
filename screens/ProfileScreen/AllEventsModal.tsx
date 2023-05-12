import { TouchableIonicon } from "@components/common/Icons"
import { EventCard } from "@components/eventCard/EventCard"
import { AppStyles } from "@lib/AppColorStyle"
import { CurrentUserEvent } from "@lib/events"
import { useNavigation } from "@react-navigation/native"
import { SetStateAction } from "react"
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  StyleSheet,
  TouchableOpacity
} from "react-native"

interface Props {
  visible: boolean
  setVisible: React.Dispatch<SetStateAction<boolean>>
  events: CurrentUserEvent[]
}

const MARGIN_HORIZONTAL = 16
const MARGIN_VERTICAL = 16

const AllEventsModal = ({ visible, setVisible, events }: Props) => {
  const navigation = useNavigation()

  return (
    <Modal style={styles.container} visible={visible} animationType="slide">
      <TouchableIonicon
        icon={{ name: "close", color: AppStyles.darkColor }}
        style={styles.iconStyle}
        onPress={() => {
          setVisible(false)
        }}
      />
      <FlatList
        data={events}
        renderItem={({ item }: ListRenderItemInfo<CurrentUserEvent>) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Event Details", { event: item })
            }
            style={styles.eventSpacing}
          >
            <EventCard event={item} />
          </TouchableOpacity>
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
    marginRight: 16,
    marginVertical: 8
  }
})

export default AllEventsModal
