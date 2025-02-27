import { TiFBottomSheetProvider } from "@components/BottomSheet"
import { clientSideEventFromResponse } from "@event/ClientSideEvent"
import { delayData } from "@lib/utils/DelayData"
import { uuidString } from "TiFShared/lib/UUID"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import {
  createTestQueryClient,
  TestQueryClientProvider
} from "@test-helpers/ReactQuery"
import { AlphaUserSessionProvider, AlphaUserStorage } from "@user/alpha"
import { AlphaUserMocks } from "@user/alpha/MockData"
import { FriendRequestFeature } from "@user/FriendRequest"
import { EmailAddress } from "@user/privacy"
import React from "react"
import { useUpcomingEvents } from "user-profile-boundary/UpcomingEvents"
import { ComponentStory } from "../../../.storybook/components"
import { BASE_HEADER_SCREEN_OPTIONS } from "../../../components/Navigation"
import {
  EventAttendeeMocks,
  EventMocks
} from "../../../event-details-boundary/MockData"
import {
  UserInfoView,
  UserProfileView,
  useUserProfile
} from "../../../user-profile-boundary/UserProfile"
import { StoryMeta } from "../../HelperTypes"
import { UserProfileFeature } from "user-profile-boundary/Context"

const ProfileMeta: StoryMeta = {
  title: "Profile Screen"
}
export default ProfileMeta

type ProfileStory = ComponentStory<typeof UserInfoView>

const Stack = createStackNavigator()

const queryClient = createTestQueryClient()

const storage = AlphaUserStorage.ephemeral()

const TEST_USER_SESSION = {
  id: uuidString(),
  primaryContactInfo: EmailAddress.peacock69
}

export const Basic: ProfileStory = () => {
  return (
    <AlphaUserSessionProvider storage={storage}>
      <TiFBottomSheetProvider>
        <TestQueryClientProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="profileDisplay"
              screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}
            >
              <Stack.Screen name="profile" component={ProfileTestScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </TestQueryClientProvider>
      </TiFBottomSheetProvider>
    </AlphaUserSessionProvider>
  )
}

const ProfileTestScreen = () => {
  return (
    <FriendRequestFeature.Provider
      sendFriendRequest={async () => delayData("friends", 3000)}
    >
      <UserProfileFeature.Provider
        fetchUserProfile={async () => ({
          status: "success",
          user: {
            ...AlphaUserMocks.TheDarkLord,
            relationStatus: "not-friends"
          }
        })}
        fetchUpcomingEvents={async () => ({
          status: "success",
          events: [
            clientSideEventFromResponse({
              ...EventMocks.MockMultipleAttendeeResponse,
              attendeeCount: 4,
              userAttendeeStatus: "hosting",
              previewAttendees: [
                ...EventMocks.MockMultipleAttendeeResponse.previewAttendees,
                {
                  ...EventMocks.MockMultipleAttendeeResponse
                    .previewAttendees[0],
                  id: uuidString(),
                  name: "Mario"
                },
                {
                  ...EventMocks.MockMultipleAttendeeResponse
                    .previewAttendees[1],
                  id: uuidString(),
                  name: "Luigi"
                }
              ]
            }),
            clientSideEventFromResponse({
              ...EventMocks.MockMultipleAttendeeResponse,
              attendeeCount: 4,
              userAttendeeStatus: "hosting",
              previewAttendees: [
                ...EventMocks.MockMultipleAttendeeResponse.previewAttendees,
                {
                  ...EventMocks.MockMultipleAttendeeResponse
                    .previewAttendees[0],
                  id: uuidString(),
                  name: "Mario"
                },
                {
                  ...EventMocks.MockMultipleAttendeeResponse
                    .previewAttendees[1],
                  id: uuidString(),
                  name: "Luigi"
                }
              ]
            }),
            clientSideEventFromResponse({
              ...EventMocks.MockMultipleAttendeeResponse,
              attendeeCount: 4,
              userAttendeeStatus: "hosting",
              previewAttendees: [
                ...EventMocks.MockMultipleAttendeeResponse.previewAttendees,
                {
                  ...EventMocks.MockMultipleAttendeeResponse
                    .previewAttendees[0],
                  id: uuidString(),
                  name: "Mario"
                },
                {
                  ...EventMocks.MockMultipleAttendeeResponse
                    .previewAttendees[1],
                  id: uuidString(),
                  name: "Luigi"
                }
              ]
            })
          ]
        })}
      >
        <UserProfileView
          userInfoState={useUserProfile({
            userId: EventAttendeeMocks.Alivs.id
          })}
          upcomingEventsState={useUpcomingEvents({
            userId: EventAttendeeMocks.Alivs.id
          })}
          onRelationStatusChanged={(e) => console.log(e)}
        />
      </UserProfileFeature.Provider>
    </FriendRequestFeature.Provider>
  )
}
