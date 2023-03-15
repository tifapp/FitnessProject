import { SetDependencyValue } from "@lib/dependencies"
import EventFormScreen from "@screens/EventForm"
import { QueryClient, QueryClientProvider } from "react-query"
import React from "react"
import { EventColors } from "@lib/events/EventColors"
import { geocodingDependencyKey, Geocoding } from "@lib/location"
import { Alert } from "react-native"
import { dateRange } from "@lib/date"

const queryClient = new QueryClient()

export const EventFormTestScreen = () => (
  <QueryClientProvider client={queryClient}>
    <SetDependencyValue
      forKey={geocodingDependencyKey}
      value={
        {
          reverseGeocode: async () => {
            throw new Error()
          }
        } as unknown as Geocoding
      }
    >
      <EventFormScreen
        initialValues={{
          title: "Test",
          description: "Hello world this is a test.",
          color: EventColors.Red,
          dateRange: dateRange(
            new Date("2023-03-02T08:00:00"),
            new Date("2023-03-02T09:00:00")
          ),
          radiusMeters: 0,
          locationInfo: {
            coordinates: { latitude: 41.234, longitude: -121.123 },
            placemarkInfo: {
              name: "Test Location",
              address: "1234 Test Dr, Test City, CA 12345"
            }
          },
          shouldHideAfterStartDate: false
        }}
        submissionLabel="Save Event"
        onDismiss={() => Alert.alert("Dismissed")}
        onSubmit={async () => Alert.alert("Submitted")}
      />
    </SetDependencyValue>
  </QueryClientProvider>
)
