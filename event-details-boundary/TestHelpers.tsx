import {
  InternetConnectionStatus,
  InternetConnectionStatusProvider
} from "@lib/InternetConnection"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { renderHook } from "@testing-library/react-native"
import { ClientSideEvent } from "@event/ClientSideEvent"
import {
  EventDetailsFeature,
  EventDetailsLoadingResult,
  useLoadEventDetails
} from "@event/DetailsQuery"
import { QueryClient } from "@tanstack/react-query"
import { TestInternetConnectionStatus } from "@test-helpers/InternetConnectionStatus"
import { EventID } from "TiFShared/domain-models/Event"

export const renderUseLoadEventDetails = (
  eventId: EventID,
  connectionStatus: InternetConnectionStatus,
  loadEvent: (eventId: EventID) => Promise<EventDetailsLoadingResult>,
  queryClient?: QueryClient
) => {
  return renderHook((eventId: EventID) => useLoadEventDetails(eventId), {
    initialProps: eventId,
    wrapper: ({ children }: any) => (
      <EventDetailsFeature.Provider eventDetails={loadEvent}>
        <InternetConnectionStatusProvider status={connectionStatus}>
          <TestQueryClientProvider client={queryClient}>
            {children}
          </TestQueryClientProvider>
        </InternetConnectionStatusProvider>
      </EventDetailsFeature.Provider>
    )
  })
}

export const renderSuccessfulUseLoadEventDetails = (
  event: ClientSideEvent,
  queryClient: QueryClient
) => {
  return renderUseLoadEventDetails(
    event.id,
    new TestInternetConnectionStatus(true),
    async () => ({ status: "success", event }),
    queryClient
  )
}
