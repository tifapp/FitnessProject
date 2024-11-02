import React from "react"
import { RudeusView } from "./Rudeus"
import { RudeusUserStorage } from "./UserStorage"
import { RudeusAPI } from "./RudeusAPI"
import { InMemorySecureStore } from "@lib/SecureStore"
import { sharePattern } from "./PatternEditor"
import { registerUser } from "./Register"

const RudeusEditorMeta = {
  title: "Rudeus Editor"
}

export default RudeusEditorMeta

const userStorage = new RudeusUserStorage(new InMemorySecureStore())
const api = RudeusAPI(userStorage)

export const Basic = () => (
  <RudeusView
    user={async () => await userStorage.user()}
    share={async (p) => await sharePattern(p, api)}
    patterns={async () => (await api.patterns()).data.patterns}
    register={async (name) => await registerUser(name, api, userStorage)}
    style={{ height: "100%", flex: 1 }}
  />
)
