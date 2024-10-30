import React from "react"
import { RudeusView } from "./Rudeus"
import { RudeusUserStorage } from "./UserStorage"
import { RudeusAPI } from "./RudeusAPI"
import { InMemorySecureStore } from "@lib/SecureStore"

const RudeusEditorMeta = {
  title: "Rudeus Editor"
}

export default RudeusEditorMeta

const userStorage = new RudeusUserStorage(new InMemorySecureStore())
const api = RudeusAPI(userStorage)

export const Basic = () => (
  <RudeusView
    userStorage={userStorage}
    api={api}
    style={{ height: "100%", flex: 1 }}
  />
)
