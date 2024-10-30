import { RudeusAPI, RudeusAPISchema, TEST_RUDEUS_URL } from "./RudeusAPI"
import {
  mockAPIServer,
  MockAPIImplementation
} from "TiFShared/test-helpers/mockAPIServer"

export const mockRudeusServer = (
  endpointMocks: Partial<{
    [EndpointName in keyof RudeusAPI]: MockAPIImplementation<
      RudeusAPI[EndpointName]
    >
  }>
) => mockAPIServer(TEST_RUDEUS_URL, RudeusAPISchema, endpointMocks)
