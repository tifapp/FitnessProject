import { captureAlerts } from "@test-helpers/Alerts"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import { neverPromise } from "@test-helpers/Promise"
import {
    TestQueryClientProvider,
    createTestQueryClient
} from "@test-helpers/ReactQuery"
import { fakeTimers } from "@test-helpers/Timers"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import { BlockListPage } from "TiFShared/domain-models/BlockList"
import { repeatElements } from "TiFShared/lib/Array"
import { BLOCK_LIST_SETTINGS_ALERTS, useBlockListSettings } from "./BlockList"
import { mockBlockListPage } from "./MockData"

describe("BlockListSettings tests", () => {
  describe("UseBlockListSettings tests", () => {
    const nextPage = jest.fn()
    const unblockUser = jest.fn()
    const queryClient = createTestQueryClient()
    fakeTimers()
    beforeEach(() => {
      jest.resetAllMocks()
      queryClient.resetQueries()
    })

    it("should have an empty array when loading the first page of users", async () => {
      const { result } = renderUseBlockListSettings()
      expect(result.current.users).toEqual([])
    })

    it("should display the fetch status when loading the first page of users", async () => {
      nextPage.mockResolvedValueOnce(mockBlockListPage())
      const { result } = renderUseBlockListSettings()
      expect(result.current.status).toEqual("loading")
      await waitFor(() => expect(result.current.status).toEqual("success"))
    })

    it("should display an error status when failing to the load the first page of users", async () => {
      nextPage.mockRejectedValueOnce(new Error())
      const { result } = renderUseBlockListSettings()
      await waitFor(() => expect(result.current.status).toEqual("error"))
    })

    it("should display the fetch status when loading the second page of users", async () => {
      const pages = repeatElements(2, () => mockBlockListPage())
      let resolveNextPage: ((page: BlockListPage) => void) | undefined
      nextPage
        .mockImplementationOnce(async () => await Promise.resolve(pages[0]))
        .mockReturnValueOnce(
          new Promise((resolve) => (resolveNextPage = resolve))
        )
      const { result } = renderUseBlockListSettings()
      await waitFor(() => expect(result.current.status).toEqual("success"))
      act(() => result.current.nextPageRequested?.())
      await waitFor(() => expect(result.current.status).toEqual("loading"))
      resolveNextPage?.(pages[1])
      await waitFor(() => expect(result.current.status).toEqual("success"))
    })

    it("should be able to load pages of blocked users by using the next page token", async () => {
      const pages = repeatElements(2, () => mockBlockListPage())
      nextPage.mockResolvedValueOnce(pages[0]).mockResolvedValueOnce(pages[1])
      const { result } = renderUseBlockListSettings()
      await waitFor(() => expect(result.current.users).toEqual(pages[0].users))
      act(() => result.current.nextPageRequested?.())
      await waitFor(() => {
        expect(result.current.users).toEqual([
          ...pages[0].users,
          ...pages[1].users
        ])
      })
      expect(nextPage).toHaveBeenNthCalledWith(2, pages[0].nextPageToken)
    })

    it("should indicate refreshing when refreshed with active page", async () => {
      nextPage
        .mockResolvedValueOnce(mockBlockListPage())
        .mockImplementationOnce(neverPromise)
      const { result } = renderUseBlockListSettings()
      await waitFor(() => expect(result.current.status).toEqual("success"))
      expect(result.current.isRefreshing).toEqual(false)
      act(() => result.current.refreshed())
      await waitFor(() => expect(result.current.status).toEqual("refreshing"))
    })

    it("should not be able to request the next page when no next page token is available", async () => {
      const { result } = await renderUseBlockListSettingsWithInitialPage(
        mockBlockListPage(3, null)
      )
      expect(result.current.nextPageRequested).toBeUndefined()
    })

    it("should add a user's id to the active unblocking ids when trying to unblock a user", async () => {
      const page = mockBlockListPage(1)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      expect(result.current.activeUnblockingIds).toEqual([])
      act(() => result.current.userUnblocked(page.users[0]))
      expect(result.current.activeUnblockingIds).toEqual([page.users[0].id])
    })

    it("should add multiple user ids to the active unblocking ids when unblocking mutliple users", async () => {
      const page = mockBlockListPage(2)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0]))
      act(() => result.current.userUnblocked(page.users[1]))
      expect(result.current.activeUnblockingIds).toEqual([
        page.users[0].id,
        page.users[1].id
      ])
    })

    it("should remove the user id from the active unblocked ids when canceling the block confirmation alert", async () => {
      unblockUser.mockImplementation(neverPromise)
      const page = mockBlockListPage(2)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0]))
      await confirmUnblockUser()
      act(() => result.current.userUnblocked(page.users[1]))
      await cancelBlockConfirmation()
      expect(result.current.activeUnblockingIds).toEqual([page.users[0].id])
    })

    it("should attempt to unblock a user after a confirmation alert", async () => {
      const page = mockBlockListPage(2)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0]))
      expect(alertPresentationSpy).toHaveBeenCalledWith(
        BLOCK_LIST_SETTINGS_ALERTS.unblockUserConfirmation.title(
          page.users[0].name
        ),
        BLOCK_LIST_SETTINGS_ALERTS.unblockUserConfirmation.description(
          page.users[0]
        ),
        expect.any(Array)
      )
      await confirmUnblockUser()
      await waitFor(() => {
        expect(unblockUser).toHaveBeenCalledWith(page.users[0].id)
      })
    })

    it("should reset the active unblocking ids when unblock finishes", async () => {
      const page = mockBlockListPage(2)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0]))
      await confirmUnblockUser()
      await waitFor(() => {
        expect(result.current.activeUnblockingIds).toEqual([])
      })
    })

    it("should only reset the active unblocking ids in a particular unblock when the unblock finishes", async () => {
      const page = mockBlockListPage(3)
      unblockUser
        .mockReturnValueOnce(Promise.resolve())
        .mockImplementationOnce(neverPromise)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0]))
      await confirmUnblockUser()
      act(() => result.current.userUnblocked(page.users[1]))
      await confirmUnblockUser()
      await waitFor(() => {
        expect(result.current.activeUnblockingIds).toEqual([page.users[1].id])
      })
    })

    it("should remove users from the block list after they have been unblocked successfully", async () => {
      const page = mockBlockListPage(2)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[1]))
      await confirmUnblockUser()
      await waitFor(() => {
        expect(result.current.users).toEqual([page.users[0]])
      })
    })

    it("should display the unblock failure error alert when unblocking user fails", async () => {
      unblockUser.mockRejectedValueOnce(new Error())
      const page = mockBlockListPage(3)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[1]))
      await confirmUnblockUser()
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.title,
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.description,
          expect.any(Array)
        )
      })
    })

    it("should not spam the user with unblock failed alerts when multiple users fail to be unblocked", async () => {
      unblockUser
        .mockRejectedValueOnce(new Error())
        .mockRejectedValueOnce(new Error())
      const page = mockBlockListPage(3)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[1]))
      await confirmUnblockUser()
      act(() => result.current.userUnblocked(page.users[2]))
      await confirmUnblockUser()
      await verifyNeverOccurs(() => {
        expect(alertPresentationSpy).toHaveBeenNthCalledWith(
          4,
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.title,
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.description,
          expect.any(Array)
        )
      })
      expect(alertPresentationSpy).toHaveBeenCalledTimes(3)
    })

    it("should reallow unblock error alerts to be presented when the user dismisses the prior error alert", async () => {
      unblockUser
        .mockRejectedValueOnce(new Error())
        .mockRejectedValueOnce(new Error())
      const page = mockBlockListPage(3)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[1]))
      await confirmUnblockUser()
      await waitFor(() => expect(alertPresentationSpy).toHaveBeenCalledTimes(2))
      await dismissUnblockErrorAlert()
      act(() => result.current.userUnblocked(page.users[2]))
      await confirmUnblockUser()
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenNthCalledWith(
          4,
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.title,
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.description,
          expect.any(Array)
        )
      })
    })

    it("should show unblock single user success banner after successful unblock", async () => {
      const page = mockBlockListPage(3)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0]))
      expect(result.current.mostRecentUnblockedUser).toBeUndefined()
      await confirmUnblockUser()
      await waitFor(() => {
        expect(result.current.mostRecentUnblockedUser).toEqual(page.users[0])
      })
    })

    const { alertPresentationSpy, tapAlertButton } = captureAlerts()

    const confirmUnblockUser = async () => {
      await tapAlertButton("Confirm")
    }

    const cancelBlockConfirmation = async () => {
      await tapAlertButton("Cancel")
    }

    const dismissUnblockErrorAlert = async () => {
      await tapAlertButton("Ok")
    }

    const renderUseBlockListSettingsWithInitialPage = async (
      page: BlockListPage
    ) => {
      nextPage.mockResolvedValueOnce(page)
      const hook = renderUseBlockListSettings()
      await waitFor(() => {
        expect(hook.result.current.users.length).toBeGreaterThan(0)
      })
      return hook
    }

    const renderUseBlockListSettings = () => {
      return renderHook(() => useBlockListSettings({ nextPage, unblockUser }), {
        wrapper: ({ children }: any) => (
          <TestQueryClientProvider client={queryClient}>
            {children}
          </TestQueryClientProvider>
        )
      })
    }
  })
})
