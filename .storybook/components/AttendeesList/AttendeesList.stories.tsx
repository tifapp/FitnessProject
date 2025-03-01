import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { EventMocks } from "@event-details-boundary/MockData"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { View } from "react-native"
import { StoryMeta } from ".storybook/HelperTypes"
import {
  EventAttendeesListView,
  useEventAttendeesList
} from "@event-details-boundary/AttendeesList"
import { clientSideEventFromResponse } from "@event/ClientSideEvent"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { FriendRequestFeature } from "@user/FriendRequest"
import { RootSiblingParent } from "react-native-root-siblings"
import { delayData } from "@lib/utils/DelayData"
import { UserHandle } from "TiFShared/domain-models/User"
import { uuidString } from "TiFShared/lib/UUID"

const AttendeesListMeta: StoryMeta = {
  title: "Attendees List Screen"
}
export default AttendeesListMeta

type AttendeesListStory = ComponentStory<typeof View>

const Stack = createStackNavigator()

export const Basic: AttendeesListStory = () => (
  <RootSiblingParent>
    <TestQueryClientProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="attendeesList"
          screenOptions={{ ...BASE_HEADER_SCREEN_OPTIONS }}
        >
          <Stack.Screen
            name="attendeesList"
            component={AttendeesListTestScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </TestQueryClientProvider>
  </RootSiblingParent>
)

const AttendeesListTestScreen = () => {
  return (
    <View>
      <FriendRequestFeature.Provider
        sendFriendRequest={async () => delayData("friends", 3000)}
      >
        <EventAttendeesListView
          state={useEventAttendeesList({
            eventId: 1,
            event: async () => {
              // await sleep(10_000)
              return {
                status: "success",
                event: clientSideEventFromResponse({
                  ...EventMocks.MockSingleAttendeeResponse,
                  previewAttendees: [
                    {
                      ...EventMocks.MockSingleAttendeeResponse
                        .previewAttendees[0],
                      relationStatus: "not-friends",
                      arrivedDateTime: new Date()
                    },
                    {
                      ...EventMocks.MockSingleAttendeeResponse
                        .previewAttendees[0],
                      id: uuidString(),
                      name: "Blob the OompaLoompa",
                      handle: UserHandle.optionalParse("blob_oompa")!,
                      arrivedDateTime: new Date(),
                      relationStatus: "friend-request-sent"
                    },
                    {
                      ...EventMocks.MockSingleAttendeeResponse
                        .previewAttendees[0],
                      id: uuidString(),
                      handle: UserHandle.optionalParse("sean_blovity")!,
                      name: "Sean Blovity",
                      relationStatus: "friend-request-received"
                    },
                    {
                      ...EventMocks.MockSingleAttendeeResponse
                        .previewAttendees[0],
                      id: uuidString(),
                      handle: UserHandle.optionalParse("big_chungus")!,
                      name: "Big Chungus",
                      relationStatus: "not-friends"
                    }
                  ]
                })
              }
            }
          })}
          onExploreOtherEventsTapped={() => console.log("Explore others")}
          style={{ height: "100%" }}
        />
      </FriendRequestFeature.Provider>
    </View>
  )
}
