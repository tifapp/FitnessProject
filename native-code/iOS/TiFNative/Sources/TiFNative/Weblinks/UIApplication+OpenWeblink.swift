import UIKit
import SafariServices

// MARK: - Effect

extension UIApplication {
  /// Attempts to open a `URL` based on the user's preferences.
  ///
  /// If the use prefers to open the `URL` in an in-app browser, then this method will first try to
  /// open the `URL` in an app the user has installed. If no installed app is found, then an
  /// `SFSafariViewController` is presented from the root view controller.
  public func openWeblink(
    _ url: URL,
    shouldUseInAppBrowser: Bool,
    shouldUseSafariReaderMode: Bool
  ) async -> Bool {
    guard shouldUseInAppBrowser else { return await self.open(url) }
    let didDeepLink = await self.open(url, options: [.universalLinksOnly: true])
    guard !didDeepLink else { return true }
    self.launchInAppSafari(url: url, shouldUseReaderMode: shouldUseSafariReaderMode)
    return true
  }
}

// MARK: - Helper

extension UIApplication {
  fileprivate func launchInAppSafari(url: URL, shouldUseReaderMode: Bool) {
    let configuration = SFSafariViewController.Configuration()
    configuration.entersReaderIfAvailable = shouldUseReaderMode
    let vc = SFSafariViewController(url: url, configuration: configuration)
    vc.modalPresentationStyle = .overFullScreen
    let scene = self.connectedScenes.first as? UIWindowScene
    let rootVc = scene?.windows.first(where: \.isKeyWindow)?.rootViewController
    rootVc?.present(vc, animated: true)
  }
}
