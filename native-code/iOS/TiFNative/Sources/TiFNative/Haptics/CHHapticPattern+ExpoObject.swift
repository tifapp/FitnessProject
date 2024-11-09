import CoreHaptics

// MARK: - CHHapticPattern Init

extension CHHapticPattern {
  /// Initializes a `CHHapticPattern` from an AHAP formatted ``ExpoObject``.
  ///
  /// - Parameter expoObject: An ``ExpoObject``.
  public convenience init(expoObject: ExpoObject) throws {
    try self.init(dictionary: expoObject.patternDictionary)
  }
}

// MARK: - Helpers

extension ExpoObject {
  fileprivate var patternDictionary: [CHHapticPattern.Key: Any] {
    self.reduce(into: [CHHapticPattern.Key: Any]()) { acc, entry in
      let key = CHHapticPattern.Key(rawValue: entry.key)
      if let expoObject = entry.value as? ExpoObject {
        acc[key] = expoObject.patternDictionary
      } else {
        acc[key] = entry.value
      }
    }
  }
}
