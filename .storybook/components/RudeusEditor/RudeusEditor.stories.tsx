import React from "react"
import { RudeusView } from "./Rudeus"
import { RudeusUserStorage } from "./UserStorage"

const RudeusEditorMeta = {
  title: "Rudeus Editor"
}

export default RudeusEditorMeta

export const Basic = () => (
  <RudeusView
    user={async () => await RudeusUserStorage.shared.user()}
    style={{ height: "100%", flex: 1 }}
  />
)
