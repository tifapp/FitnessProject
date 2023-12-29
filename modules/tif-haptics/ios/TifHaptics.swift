import CoreHaptics

/// A haptic event that is playable by the app.
public enum HapticEvent: String, CaseIterable {
  /// Used for when the user changes the selection of an item in some menu (eg. a form)
  case selection
}

// MARK: - Haptics engine

/// A class for playing haptics using CoreHaptics under the hood.
public final class TiFHapticsEngine: @unchecked Sendable {
  private let hapticEngine: CHHapticEngine // NB: - Per apple docs, CoreHaptics is thread-safe

  public init() throws {
    self.hapticEngine = try .createTiFInstance()
  }

  public func play(event: HapticEvent) async throws {
    try await self.hapticEngine.start()

    switch event {
    case .selection:
      try self.playSelection()
    }
  }

  private func playSelection() throws {
    try self.play(
      pattern: CHHapticPattern(
        events: [
          CHHapticEvent(
            eventType: .hapticTransient,
            parameters: [
              CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.5),
              CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.5)
            ],
            relativeTime: CHHapticTimeImmediate
          )
        ],
        parameters: []
      )
    )
  }
  
  private func play(pattern: CHHapticPattern) throws {
    try self.hapticEngine.makePlayer(with: pattern).start(atTime: CHHapticTimeImmediate)
  }

  public func mute() {
    self.hapticEngine.isMutedForHaptics = true
  }

  public func unmute() {
    self.hapticEngine.isMutedForHaptics = false
  }
}

// MARK: - Helpers

extension CHHapticEngine {
  fileprivate static func createTiFInstance() throws -> CHHapticEngine {
    let engine = try CHHapticEngine()
    engine.isAutoShutdownEnabled = true
    engine.resetHandler = { [weak engine] in try? engine?.start() }
    return engine
  }
}