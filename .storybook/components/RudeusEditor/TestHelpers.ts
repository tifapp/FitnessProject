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

export const MOCK_USER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTJkYWI0LWEwOGQtNzdiNi05MDJjLWEyOTdjNThhZTAzNSIsIm5hbWUiOiJCbG9iIn0.4jywZaAjYdGd2DCh1XhGExWTFvs_HgqyuZ6rINW_gtc"

export const MOCK_USER = {
  id: "0192dab4-a08d-77b6-902c-a297c58ae035",
  name: "Blob"
}
