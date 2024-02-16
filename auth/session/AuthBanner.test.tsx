import { render, screen, waitFor } from "@testing-library/react-native"
import React from "react"
import { View } from "react-native"
import "@test-helpers/Matchers"
import { TestQueryClientProvider } from "@test-helpers/ReactQuery"
import { IfAuthenticated } from "./AuthBanner"
import { UserSessionContextProvider } from "./UserSessionContext"
import { fakeTimers } from "@test-helpers/Timers"

describe("AuthBanner tests", () => {
  beforeEach(() => jest.resetAllMocks())
  fakeTimers()

  test("AuthBanner replaces screen, if the user is not authenticated", async () => {
    renderTestScreen(jest.fn().mockResolvedValueOnce(false))
    await waitFor(() => expect(elseComponent()).toBeDisplayed())
    await waitFor(() => expect(thenComponent()).not.toBeDisplayed())
  })
  test("AuthBanner does not replace screen, if user is authenticated", async () => {
    renderTestScreen(jest.fn().mockResolvedValueOnce(true))
    await waitFor(() => expect(thenComponent()).toBeDisplayed())
    expect(elseComponent()).not.toBeDisplayed()
  })
})

const thenComponent = () => {
  return screen.queryByTestId("then")
}

const elseComponent = () => {
  return screen.queryByTestId("else")
}

const renderTestScreen = (isSignedIn: () => Promise<boolean>) => {
  return render(
    <TestQueryClientProvider>
      <UserSessionContextProvider isSignedIn={isSignedIn}>
        <IfAuthenticated
          thenRender={<View testID="then" />}
          elseRender={<View testID="else" />}
        />
      </UserSessionContextProvider>
    </TestQueryClientProvider>
  )
}
