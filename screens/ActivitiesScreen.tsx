import React, { useEffect } from "react"
import { LocationObject, watchPositionAsync } from "expo-location"

const ActivitiesScreen = () => {
  useEffect(() => {
    watchPositionAsync(
      {},
      (location: LocationObject) => console.log(location)
    ).catch((err: any) => console.error(err.code))
  }, [])
  return <></>
}

export default ActivitiesScreen
