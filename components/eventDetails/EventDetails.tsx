import React, { forwardRef, useState } from "react"
import { Modal, View } from "react-native"

const EventDetails = forwardRef((_, ref) => {
  return (
    <Modal ref={ref}>
      <View></View>
    </Modal>
  )
})

export default EventDetails
