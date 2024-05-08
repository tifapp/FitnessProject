import { privacySettingsPermissionsStatus } from "./PrivacySettings"
import { PermissionResponse } from "expo-modules-core"

describe("PrivacySettings tests", () => {
  describe("PrivacySettingsPermissionsStatus tests", () => {
    const TEST_PERMISSIONS_RESPONSE = {
      granted: false,
      canAskAgain: false
    } as PermissionResponse

    test("permissions response is null, treats status as permissions is denied with request access", () => {
      const openSettings = jest.fn()
      const requestPermission = jest.fn()
      const { isGranted, action } = privacySettingsPermissionsStatus(
        null,
        requestPermission,
        openSettings
      )
      action()
      expect(isGranted).toEqual(false)
      expect(openSettings).not.toHaveBeenCalled()
      expect(requestPermission).toHaveBeenCalled()
    })

    it("should return the open settings function as the action if the permission is granted", () => {
      const openSettings = jest.fn()
      const requestPermission = jest.fn()
      const { action } = privacySettingsPermissionsStatus(
        {
          ...TEST_PERMISSIONS_RESPONSE,
          granted: true
        },
        requestPermission,
        openSettings
      )
      action()
      expect(openSettings).toHaveBeenCalled()
      expect(requestPermission).not.toHaveBeenCalled()
    })

    it("should return the request function as the action if the permission is not granted", () => {
      const openSettings = jest.fn()
      const requestPermission = jest.fn()
      const { action } = privacySettingsPermissionsStatus(
        {
          ...TEST_PERMISSIONS_RESPONSE,
          granted: false,
          canAskAgain: true
        },
        requestPermission,
        openSettings
      )
      action()
      expect(openSettings).not.toHaveBeenCalled()
      expect(requestPermission).toHaveBeenCalled()
    })

    it("should return the open settings function as the action if permission is denied and cannot ask again", () => {
      const openSettings = jest.fn()
      const requestPermission = jest.fn()
      const { action } = privacySettingsPermissionsStatus(
        {
          ...TEST_PERMISSIONS_RESPONSE,
          granted: false,
          canAskAgain: false
        },
        requestPermission,
        openSettings
      )
      action()
      expect(openSettings).toHaveBeenCalled()
      expect(requestPermission).not.toHaveBeenCalled()
    })
  })
})
