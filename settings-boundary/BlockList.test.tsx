import { repeatElements } from "TiFShared/lib/Array"
import { mockBlockListPage } from "./MockData"
import { act, renderHook, waitFor } from "@testing-library/react-native"
import {
  BLOCK_LIST_SETTINGS_ALERTS,
  BlockListPage,
  useBlockListSettings
} from "./BlockList"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { fakeTimers } from "@test-helpers/Timers"
import { neverPromise } from "@test-helpers/Promise"
import { verifyNeverOccurs } from "@test-helpers/ExpectNeverOccurs"
import { captureAlerts } from "@test-helpers/Alerts"

describe("BlockListSettings tests", () => {
  describe("UseBlockListSettings tests", () => {
    const nextPage = jest.fn()
    const unblockUsers = jest.fn()
    const TEST_UNBLOCK_DEBOUNCE_TIME = 1000
    fakeTimers()
    beforeEach(() => jest.resetAllMocks())

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

    it("should have a loading status when refreshing", async () => {
      nextPage
        .mockResolvedValueOnce(mockBlockListPage())
        .mockImplementationOnce(neverPromise)
      const { result } = renderUseBlockListSettings()
      await waitFor(() => expect(result.current.status).toEqual("success"))
      act(() => result.current.refreshed())
      await waitFor(() => expect(result.current.status).toEqual("loading"))
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
      act(() => result.current.userUnblocked(page.users[0].id))
      expect(result.current.activeUnblockingIds).toEqual([page.users[0].id])
    })

    it("should add multiple user ids to the active unblocking ids when unblocking mutliple users", async () => {
      const page = mockBlockListPage(2)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0].id))
      act(() => result.current.userUnblocked(page.users[1].id))
      expect(result.current.activeUnblockingIds).toEqual([
        page.users[0].id,
        page.users[1].id
      ])
    })

    it("should attempt to unblock a user after a small debounce time", async () => {
      const page = mockBlockListPage(2)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0].id))
      act(() => jest.advanceTimersByTime(TEST_UNBLOCK_DEBOUNCE_TIME / 2))
      await verifyNeverOccurs(() => expect(unblockUsers).toHaveBeenCalled())
      act(() => jest.advanceTimersByTime(TEST_UNBLOCK_DEBOUNCE_TIME / 2))
      await waitFor(() => {
        expect(unblockUsers).toHaveBeenCalledWith([page.users[0].id])
      })
    })

    it("should reset debounce time when trying to block multiple users at once", async () => {
      const page = mockBlockListPage(2)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0].id))
      act(() => jest.advanceTimersByTime(TEST_UNBLOCK_DEBOUNCE_TIME / 2))
      act(() => result.current.userUnblocked(page.users[1].id))
      await verifyNeverOccurs(() => expect(unblockUsers).toHaveBeenCalled())
      act(() => jest.advanceTimersByTime(TEST_UNBLOCK_DEBOUNCE_TIME / 2))
      await waitFor(() => {
        expect(unblockUsers).toHaveBeenCalledWith([
          page.users[0].id,
          page.users[1].id
        ])
      })
    })

    it("should reset the active unblocking ids when unblock finishes", async () => {
      const page = mockBlockListPage(2)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0].id))
      act(() => jest.advanceTimersByTime(TEST_UNBLOCK_DEBOUNCE_TIME))
      await waitFor(() => {
        expect(result.current.activeUnblockingIds).toEqual([])
      })
    })

    it("should remove users from the block list after they have been unblocked successfully", async () => {
      const page = mockBlockListPage(3)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[1].id))
      act(() => result.current.userUnblocked(page.users[2].id))
      act(() => jest.advanceTimersByTime(TEST_UNBLOCK_DEBOUNCE_TIME))
      await waitFor(() => {
        expect(result.current.users).toEqual([page.users[0]])
      })
    })

    it("should display the singular unblock failure error alert when unblocking 1 user fails", async () => {
      unblockUsers.mockRejectedValueOnce(new Error())
      const page = mockBlockListPage(3)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[1].id))
      act(() => jest.advanceTimersByTime(TEST_UNBLOCK_DEBOUNCE_TIME))
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.title,
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.description(1)
        )
      })
    })

    it("should display the plural unblock failure error alert when unblocking multiple users fails", async () => {
      unblockUsers.mockRejectedValueOnce(new Error())
      const page = mockBlockListPage(3)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0].id))
      act(() => result.current.userUnblocked(page.users[1].id))
      act(() => jest.advanceTimersByTime(TEST_UNBLOCK_DEBOUNCE_TIME))
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenCalledWith(
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.title,
          BLOCK_LIST_SETTINGS_ALERTS.unblockUserFailed.description(2)
        )
      })
    })

    it("should show unblock single user success banner after successful unblock", async () => {
      const page = mockBlockListPage(3)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0].id))
      expect(result.current.unblockSuccessBannerId).toBeUndefined()
      act(() => jest.advanceTimersByTime(TEST_UNBLOCK_DEBOUNCE_TIME))
      await waitFor(() => {
        expect(result.current.unblockSuccessBannerId).toEqual("single-user")
      })
    })

    it("should show unblock multiple users success banner after successful unblock", async () => {
      const page = mockBlockListPage(3)
      const { result } = await renderUseBlockListSettingsWithInitialPage(page)
      act(() => result.current.userUnblocked(page.users[0].id))
      act(() => result.current.userUnblocked(page.users[1].id))
      expect(result.current.unblockSuccessBannerId).toBeUndefined()
      act(() => jest.advanceTimersByTime(TEST_UNBLOCK_DEBOUNCE_TIME))
      await waitFor(() => {
        expect(result.current.unblockSuccessBannerId).toEqual("multiple-users")
      })
    })

    const { alertPresentationSpy } = captureAlerts()

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
      return renderHook(
        () =>
          useBlockListSettings({
            nextPage,
            unblockUsers,
            unblockDebounceMillis: TEST_UNBLOCK_DEBOUNCE_TIME
          }),
        {
          wrapper: ({ children }: any) => (
            <TestQueryClientProvider>{children}</TestQueryClientProvider>
          )
        }
      )
    }
  })
})
