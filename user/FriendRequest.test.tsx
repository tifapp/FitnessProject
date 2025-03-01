import { act, renderHook, waitFor } from "@testing-library/react-native"
import { UserHandle, UserRelationsStatus } from "TiFShared/domain-models/User"
import { ALERTS, FriendRequestFeature, useFriendRequest } from "./FriendRequest"
import { uuidString } from "TiFShared/lib/UUID"
import { faker } from "@faker-js/faker"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { captureAlerts } from "@test-helpers/Alerts"

describe("FriendRequest tests", () => {
  describe("UseFriendRequest tests", () => {
    const sendFriendRequest = jest.fn()
    const onSuccess = jest.fn()

    beforeEach(() => jest.resetAllMocks())

    const TEST_USER = {
      id: uuidString(),
      name: faker.name.firstName(),
      handle: UserHandle.sillyBitchell,
      relationStatus: "not-friends"
    }

    it.each([
      "blocked-them",
      "blocked-you",
      "friends",
      "current-user",
      "friend-request-sent"
    ])(
      "should not allow sending a friend request when status is %s",
      (status: UserRelationsStatus) => {
        const { result } = renderUseFriendRequest(status)
        expect(result.current.submission.status).toEqual("invalid")
      }
    )

    it("should call the onSuccess callback with the updated relation status when request sent successfully", async () => {
      const { result } = renderUseFriendRequest()
      sendFriendRequest.mockResolvedValueOnce("friend-request-sent")
      expect(result.current.updatedStatus).toEqual(undefined)
      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith("friend-request-sent")
      })
      expect(sendFriendRequest).toHaveBeenCalledWith(TEST_USER.id)
      expect(result.current.updatedStatus).toEqual("friend-request-sent")
    })

    it.each(["user-not-found", "blocked-you"])(
      "should present an error alert for %s",
      async (status: "user-not-found" | "blocked-you") => {
        const { result } = renderUseFriendRequest()
        sendFriendRequest.mockResolvedValueOnce(status)
        expect(result.current.updatedStatus).toEqual(undefined)
        act(() => (result.current.submission as any).submit())

        await waitFor(() => {
          expect(alertPresentationSpy).toHaveBeenPresentedWith(
            ALERTS[status](TEST_USER)
          )
        })
        expect(onSuccess).not.toHaveBeenCalled()
        expect(result.current.updatedStatus).toEqual(undefined)
      }
    )

    it("should present a generic error alert for an error", async () => {
      const { result } = renderUseFriendRequest()
      sendFriendRequest.mockRejectedValueOnce(new Error())
      expect(result.current.updatedStatus).toEqual(undefined)
      act(() => (result.current.submission as any).submit())

      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          ALERTS.genericError
        )
      })
      expect(onSuccess).not.toHaveBeenCalled()
      expect(result.current.updatedStatus).toEqual(undefined)
    })

    const { alertPresentationSpy } = captureAlerts()

    const renderUseFriendRequest = (
      relationStatus: UserRelationsStatus = "not-friends"
    ) => {
      return renderHook(
        () => {
          return useFriendRequest({
            user: { ...TEST_USER, relationStatus },
            onSuccess
          })
        },
        {
          wrapper: ({ children }) => (
            <FriendRequestFeature.Provider
              sendFriendRequest={sendFriendRequest}
            >
              <TestQueryClientProvider>{children}</TestQueryClientProvider>
            </FriendRequestFeature.Provider>
          )
        }
      )
    }
  })
})
