// MARK: - HapticsSettings

public struct HapticsSettings: Hashable, Sendable {
  public let isFeedbackEnabled: Bool
  public let isAudioEnabled: Bool
  
  public init(isFeedbackEnabled: Bool, isAudioEnabled: Bool) {
    self.isFeedbackEnabled = isFeedbackEnabled
    self.isAudioEnabled = isAudioEnabled
  }
}

// MARK: - Expo Object Init

extension HapticsSettings {
  public init(expoObject: ExpoObject) throws {
    guard let isFeedbackEnabled = expoObject["isHapticFeedbackEnabled"] as? Bool,
          let isAudioEnabled = expoObject["isHapticAudioEnabled"] as? Bool else {
      throw ExpoObjectErrror.decoding
    }
    self.isFeedbackEnabled = isFeedbackEnabled
    self.isAudioEnabled = isAudioEnabled
  }
}
