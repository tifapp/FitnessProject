import { act, renderHook, waitFor } from "@testing-library/react-native"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { TestHaptics } from "@test-helpers/Haptics"
import { captureAlerts } from "@test-helpers/Alerts"
import { InMemorySecureStore } from "@lib/SecureStore"
import {
  HapticsProvider,
  transientEvent,
  hapticPattern,
  events
} from "@modules/tif-haptics"
import { ALERTS, sharePattern, useRudeusPatternEditor } from "./PatternEditor"
import {
  EMPTY_PATTERN_EDITOR_PATTERN,
  MOCK_USER,
  RudeusEditorPattern
} from "./Models"
import { RudeusUserStorage } from "./UserStorage"
import { RudeusAPI, TEST_RUDEUS_URL } from "./RudeusAPI"
import { Provider, createStore } from "jotai"
import React from "react"
import { mockRudeusServer } from "./TestHelpers"
import { setPlatform } from "@test-helpers/Platform"
import { uuidString } from "TiFShared/lib/UUID"

describe("PatternEditor tests", () => {
  describe("UseRudeusPatternEditor tests", () => {
    const tokenStorage = new RudeusUserStorage(new InMemorySecureStore())
    const api = RudeusAPI(tokenStorage, TEST_RUDEUS_URL)
    const store = createStore()
    let testHaptics = new TestHaptics()
    beforeEach(() => {
      setPlatform("ios")
      testHaptics = new TestHaptics()
    })

    const PATTERN_EVENT_1 = {
      isHidden: false,
      element: {
        Event: transientEvent(0, { HapticIntensity: 0.5 })
      }
    }
    const PATTERN_EVENT_2 = {
      isHidden: false,
      element: {
        Event: transientEvent(0.1, {
          HapticIntensity: 0.5,
          HapticSharpness: 0.65
        })
      }
    }
    const EXPECTED_PATTERN = {
      ...hapticPattern(
        events(PATTERN_EVENT_1.element.Event, PATTERN_EVENT_2.element.Event)
      ),
      Version: 1
    }

    const EXPECTED_SHARE_REQUEST = {
      id: null,
      name: "Test Pattern",
      description: "This is a test pattern",
      ahapPattern: EXPECTED_PATTERN,
      platform: "ios" as const
    }

    it("should not be able to share without a name", async () => {
      const { result } = renderUseRudeusPatternEditor()
      act(() => store.set(result.current.pattern.name, ""))
      act(() => result.current.eventAdded())
      expect(result.current.submission.status).toEqual("invalid")
    })

    it("should not be able to share without events", async () => {
      const { result } = renderUseRudeusPatternEditor()
      act(() => store.set(result.current.pattern.name, "Hello"))
      expect(result.current.submission.status).toEqual("invalid")
    })

    it("should be able to share a new pattern", async () => {
      const { result } = renderUseRudeusPatternEditor()
      act(() => store.set(result.current.pattern.name, "Test Pattern"))
      act(() => {
        store.set(result.current.pattern.description, "This is a test pattern")
      })
      act(() => result.current.eventAdded())
      act(() =>
        store.set(result.current.pattern.events[0].atom, PATTERN_EVENT_1)
      )
      act(() => result.current.eventAdded())
      act(() =>
        store.set(result.current.pattern.events[1].atom, PATTERN_EVENT_2)
      )

      mockRudeusServer({
        sharePattern: {
          expectedRequest: {
            body: EXPECTED_SHARE_REQUEST
          },
          mockResponse: {
            status: 201,
            data: {
              ...EXPECTED_SHARE_REQUEST,
              id: uuidString(),
              user: MOCK_USER
            }
          }
        }
      })
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          ALERTS.sharedSuccessfully
        )
      })
    })

    it("should keep hidden events when sharing", async () => {
      const { result } = renderUseRudeusPatternEditor()
      act(() => store.set(result.current.pattern.name, "Test"))
      act(() => result.current.eventAdded())
      act(() => {
        store.set(result.current.pattern.events[0].atom, {
          ...PATTERN_EVENT_1,
          isHidden: true
        })
      })
      act(() => result.current.eventAdded())
      act(() => {
        store.set(result.current.pattern.events[1].atom, PATTERN_EVENT_2)
      })

      mockRudeusServer({
        sharePattern: {
          expectedRequest: { body: { ahapPattern: EXPECTED_PATTERN } },
          mockResponse: {
            status: 201,
            data: {
              ...EXPECTED_SHARE_REQUEST,
              id: uuidString(),
              user: MOCK_USER
            }
          }
        }
      })
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          ALERTS.sharedSuccessfully
        )
      })
    })

    it("should use the generated ID when sharing a pattern for the second time", async () => {
      const { result } = renderUseRudeusPatternEditor()
      act(() => store.set(result.current.pattern.name, "Test Pattern"))
      act(() => {
        store.set(result.current.pattern.description, "This is a test pattern")
      })
      act(() => result.current.eventAdded())
      act(() =>
        store.set(result.current.pattern.events[0].atom, PATTERN_EVENT_1)
      )
      act(() => result.current.eventAdded())
      act(() =>
        store.set(result.current.pattern.events[1].atom, PATTERN_EVENT_2)
      )

      const expectedId = uuidString()

      mockRudeusServer({
        sharePattern: {
          mockResponse: {
            status: 201,
            data: { ...EXPECTED_SHARE_REQUEST, id: expectedId, user: MOCK_USER }
          }
        }
      })
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          ALERTS.sharedSuccessfully
        )
      })

      mockRudeusServer({
        sharePattern: {
          expectedRequest: { body: { id: expectedId } },
          mockResponse: {
            status: 200,
            data: { ...EXPECTED_SHARE_REQUEST, id: expectedId, user: MOCK_USER }
          }
        }
      })
      await waitFor(() => {
        expect(result.current.submission.status).toEqual("submittable")
      })
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenNthPresentedWith(
          2,
          ALERTS.sharedSuccessfully
        )
      })
    })

    it("should present an error alert when failing to share pattern", async () => {
      const { result } = renderUseRudeusPatternEditor()
      act(() => store.set(result.current.pattern.name, "Test Pattern"))
      act(() => {
        store.set(result.current.pattern.description, "This is a test pattern")
      })
      act(() => result.current.eventAdded())
      act(() =>
        store.set(result.current.pattern.events[0].atom, PATTERN_EVENT_1)
      )
      act(() => result.current.eventAdded())
      act(() =>
        store.set(result.current.pattern.events[1].atom, PATTERN_EVENT_2)
      )

      mockRudeusServer({
        sharePattern: { mockResponse: { status: 500 } as any }
      })
      act(() => (result.current.submission as any).submit())
      await waitFor(() => {
        expect(alertPresentationSpy).toHaveBeenPresentedWith(
          ALERTS.sharedUnsuccessfully
        )
      })
    })

    it("should be able to add events between events", () => {
      const { result } = renderUseRudeusPatternEditor()
      act(() => result.current.eventAdded())
      act(() => result.current.eventAdded())
      const beforeIds = result.current.pattern.events.map((e) => e.id)
      act(() => result.current.eventAdded(result.current.pattern.events[0].id))

      expect(result.current.pattern.events.map((e) => e.id)).toEqual([
        beforeIds[0],
        expect.any(String),
        beforeIds[1]
      ])
    })

    it("should be able to play the edited pattern", () => {
      const { result } = renderUseRudeusPatternEditor()
      act(() => result.current.eventAdded())
      act(() =>
        store.set(result.current.pattern.events[0].atom, PATTERN_EVENT_1)
      )
      act(() => result.current.eventAdded())
      act(() =>
        store.set(result.current.pattern.events[1].atom, PATTERN_EVENT_2)
      )

      expect(testHaptics.playedEvents).toEqual([])
      act(() => result.current.played())
      expect(testHaptics.playedEvents).toEqual([EXPECTED_PATTERN])
    })

    it("should not play hidden pattern events", () => {
      const { result } = renderUseRudeusPatternEditor()
      act(() => result.current.eventAdded())
      act(() => {
        store.set(result.current.pattern.events[0].atom, {
          ...PATTERN_EVENT_1,
          isHidden: true
        })
      })
      act(() => result.current.eventAdded())
      act(() =>
        store.set(result.current.pattern.events[1].atom, PATTERN_EVENT_2)
      )

      expect(testHaptics.playedEvents).toEqual([])
      act(() => result.current.played())
      expect(testHaptics.playedEvents).toEqual([
        { ...hapticPattern(events(PATTERN_EVENT_2.element.Event)), Version: 1 }
      ])
    })

    it("should not play deleted pattern events", () => {
      const { result } = renderUseRudeusPatternEditor()
      act(() => result.current.eventAdded())
      act(() => {
        store.set(result.current.pattern.events[0].atom, PATTERN_EVENT_1)
      })
      act(() => result.current.eventAdded())
      act(() =>
        store.set(result.current.pattern.events[1].atom, PATTERN_EVENT_2)
      )
      act(() =>
        result.current.eventRemoved(result.current.pattern.events[1].id)
      )

      expect(testHaptics.playedEvents).toEqual([])
      act(() => result.current.played())
      expect(testHaptics.playedEvents).toEqual([
        { ...hapticPattern(events(PATTERN_EVENT_1.element.Event)), Version: 1 }
      ])
    })

    const { alertPresentationSpy } = captureAlerts()

    const renderUseRudeusPatternEditor = (
      initialPattern: RudeusEditorPattern = EMPTY_PATTERN_EDITOR_PATTERN
    ) => {
      return renderHook(
        () => {
          return useRudeusPatternEditor(initialPattern, {
            share: async (pattern) => await sharePattern(pattern, api)
          })
        },
        {
          wrapper: ({ children }) => (
            <Provider store={store}>
              <HapticsProvider haptics={testHaptics}>
                <TestQueryClientProvider>{children}</TestQueryClientProvider>
              </HapticsProvider>
            </Provider>
          )
        }
      )
    }
  })
})
