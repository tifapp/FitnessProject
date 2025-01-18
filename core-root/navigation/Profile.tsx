import { XMarkBackButton } from "@components/Navigation"
import { StaticScreenProps } from "@react-navigation/native"
import { UserHandle, UserID } from "TiFShared/domain-models/User"
import {
  UserProfileView,
  useUpcomingEvents,
  useUserProfile
} from "user-profile-boundary"

export const profileScreens = () => ({
  userProfile: {
    options: { headerLeft: XMarkBackButton, headerTitle: "" },
    screen: ProfileScreen
  }
})

type ProfileScreenProps = StaticScreenProps<{
  id: UserID | UserHandle
}>

const ProfileScreen = ({ route }: ProfileScreenProps) => {
  return (
    <UserProfileView
      userInfoState={useUserProfile({
        userId: route.params.id.toString()
      })}
      upcomingEventsState={useUpcomingEvents({
        userId: route.params.id.toString()
      })}
      onRelationStatusChanged={(e) => console.log(e)}
    />
  )
}
