import {
  InternetConnectionStatus,
  InternetConnectionStatusProvider
} from "@lib/InternetConnection"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { renderHook } from "@testing-library/react-native"
import { useLoadEventDetails } from "./Details"
import { EventID } from "@shared-models/Event"
import { EventDetailsLoadingResult } from "./Query"
import { QueryClient } from "@tanstack/react-query"

export const renderUseLoadEventDetails = (
  eventId: EventID,
  connectionStatus: InternetConnectionStatus,
  loadEvent: (eventId: EventID) => Promise<EventDetailsLoadingResult>,
  queryClient?: QueryClient
) => {
  return renderHook(
    (eventId: EventID) => useLoadEventDetails(eventId, loadEvent),
    {
      initialProps: eventId,
      wrapper: ({ children }: any) => (
        <InternetConnectionStatusProvider status={connectionStatus}>
          <TestQueryClientProvider client={queryClient}>
            {children}
          </TestQueryClientProvider>
        </InternetConnectionStatusProvider>
      )
    }
  )
}
