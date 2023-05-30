import { UserMocks } from "@lib/users/User"
import EditProfileScreen from "../EditProfileScreen/EditProfileScreen"

export const EditProfileScreenNavWrapper = () => {
  const user = UserMocks.Mia
  return <EditProfileScreen user={user}/>
}