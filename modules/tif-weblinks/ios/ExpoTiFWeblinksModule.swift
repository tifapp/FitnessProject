import ExpoModulesCore
import TiFNative
import UIKit

public class ExpoTiFWeblinksModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoTiFWeblinks")

    AsyncFunction("openWeblink") { (url: URL, shouldUseInAppBrowser: Bool, shouldUseSafariReaderMode: Bool) in
      await UIApplication.shared.openWeblink(
        url,
        shouldUseInAppBrowser: shouldUseInAppBrowser,
        shouldUseSafariReaderMode: shouldUseSafariReaderMode
      )
    }
  }
}
