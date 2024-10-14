import { render, screen, waitFor } from "@testing-library/react-native"
import React from "react"
import { View } from "react-native"
import "@test-helpers/Matchers"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { IfAuthenticated, UserSession, UserSessionProvider } from "./Session"
import { fakeTimers } from "@test-helpers/Timers"
import { EmailAddress } from "./privacy"

describe("UserSession tests", () => {
  describe("IfAuthenticated tests", () => {
    beforeEach(() => jest.resetAllMocks())
    fakeTimers()

    it("should render else if the user is not authenticated", async () => {
      renderTestScreen(jest.fn().mockRejectedValueOnce(new Error()))
      await waitFor(() => expect(elseComponent()).toBeDisplayed())
      await waitFor(() => expect(thenComponent()).not.toBeDisplayed())
    })

    it("should render then if user is authenticated", async () => {
      renderTestScreen(
        jest.fn().mockResolvedValueOnce({
          id: 1,
          primaryContactInfo: EmailAddress.peacock69
        })
      )
      await waitFor(() => expect(thenComponent()).toBeDisplayed())
      expect(elseComponent()).not.toBeDisplayed()
    })

    const thenComponent = () => {
      return screen.queryByTestId("then")
    }

    const elseComponent = () => {
      return screen.queryByTestId("else")
    }

    const renderTestScreen = (userSession: () => Promise<UserSession>) => {
      return render(
        <TestQueryClientProvider>
          <UserSessionProvider userSession={userSession}>
            <IfAuthenticated
              thenRender={<View testID="then" />}
              elseRender={<View testID="else" />}
            />
          </UserSessionProvider>
        </TestQueryClientProvider>
      )
    }
  })
})
