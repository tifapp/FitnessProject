import { AppStyles } from "@lib/AppColorStyle"
import React, { useState } from "react"
import {
  StyleSheet,
  View
} from "react-native"
import { EditEventProps } from "./EditEvent"
import { EditEventFormLocationView } from "./Location"
import TelescopeInput from "./TelescopeInput"

export const CreateEventView = ({
  hostName,
  hostProfileImageURL,
  eventId,
  currentDate = new Date(),
  onSelectLocationTapped,
  onSuccess,
  initialValues,
  style
}: EditEventProps) => {
  const [title, setTitle] = useState<string>()

  return (
    <View style={{ backgroundColor: "black", flex: 1 }}>
      <View style={{ height: "60%" }}>
        <EditEventFormLocationView hostName={hostName} onSelectLocationTapped={() => console.log("selected")} />
        <TelescopeInput onSubmit={setTitle} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1
  },
  footer: {
    position: "absolute",
    width: "100%",
    flex: 1,
    backgroundColor: "white",
    bottom: 0,
    paddingHorizontal: 24
  },
  startDateRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 16
  },
  startDateRowItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 128,
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: AppStyles.cardColor
  },
  sheetHandle: {
    opacity: 0
  },
  bottomSheetView: {
    rowGap: 16,
    paddingHorizontal: 24
  },
  bottonSheetTopRow: {
    display: "flex",
    flexDirection: "row"
  },
  bottomSheetTopRowSpacer: {
    flex: 1
  },
  durationPickerSheetStyle: {
    paddingBottom: 24
  },
  durationPicker: {
    width: "100%",
    alignSelf: "center",
    height: 256
  },
  eventTimeRangeRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 16
  },
  eventTimeRangeLabel: {
    marginRight: 16
  },
  eventTimeRangeText: {
    flex: 1
  }
})
