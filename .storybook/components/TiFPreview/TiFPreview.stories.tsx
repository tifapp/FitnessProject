import React from "react"
import { TiFView } from "@core-root"

const TiFPreview = {
  title: "TiF Preview"
}

export default TiFPreview

export const Basic = () => (
  <TiFView
    fetchEvents={async () => []}
    isFontsLoaded={true}
    style={{ flex: 1 }}
  />
)
