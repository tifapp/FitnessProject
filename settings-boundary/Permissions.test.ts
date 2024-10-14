import { PermissionResponse } from "expo-location"
import { settingsPermission } from "./Permissions"

describe("PrivacySettingsPermissionsStatus tests", () => {
  const TEST_PERMISSIONS_RESPONSE = {
    granted: false,
    canAskAgain: false
  } as PermissionResponse

  it("should return true for isGranted when permission has been granted", () => {
    const { isGranted } = settingsPermission(
      { ...TEST_PERMISSIONS_RESPONSE, granted: true },
      jest.fn(),
      jest.fn()
    )
    expect(isGranted).toEqual(true)
  })

  test("permissions response is null, treats status as permissions is denied with request access", () => {
    const openSettings = jest.fn()
    const requestPermission = jest.fn()
    const { isGranted, onToggled } = settingsPermission(
      null,
      requestPermission,
      openSettings
    )
    onToggled()
    expect(isGranted).toEqual(false)
    expect(openSettings).not.toHaveBeenCalled()
    expect(requestPermission).toHaveBeenCalled()
  })

  it("should return the open settings function as the action if the permission is granted", () => {
    const openSettings = jest.fn()
    const requestPermission = jest.fn()
    const { onToggled } = settingsPermission(
      {
        ...TEST_PERMISSIONS_RESPONSE,
        granted: true
      },
      requestPermission,
      openSettings
    )
    onToggled()
    expect(openSettings).toHaveBeenCalled()
    expect(requestPermission).not.toHaveBeenCalled()
  })

  it("should return the request function as the action if the permission is not granted", () => {
    const openSettings = jest.fn()
    const requestPermission = jest.fn()
    const { onToggled } = settingsPermission(
      {
        ...TEST_PERMISSIONS_RESPONSE,
        granted: false,
        canAskAgain: true
      },
      requestPermission,
      openSettings
    )
    onToggled()
    expect(openSettings).not.toHaveBeenCalled()
    expect(requestPermission).toHaveBeenCalled()
  })

  it("should return the open settings function as the action if permission is denied and cannot ask again", () => {
    const openSettings = jest.fn()
    const requestPermission = jest.fn()
    const { onToggled } = settingsPermission(
      {
        ...TEST_PERMISSIONS_RESPONSE,
        granted: false,
        canAskAgain: false
      },
      requestPermission,
      openSettings
    )
    onToggled()
    expect(openSettings).toHaveBeenCalled()
    expect(requestPermission).not.toHaveBeenCalled()
  })
})
