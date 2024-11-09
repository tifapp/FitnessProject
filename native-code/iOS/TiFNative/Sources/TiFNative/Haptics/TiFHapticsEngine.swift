import CoreHaptics

// MARK: - Haptics engine

/// A class for playing haptics using CoreHaptics under the hood.
public final actor TiFHapticsEngine {
  private var hapticEngine: SendableCHHapticEngine?

  public init() {}
}

// MARK: - Play

extension TiFHapticsEngine {
  public func play(expoPattern: ExpoObject) async throws {
    let engine = try self.hapticsEngine()
    try await engine.start()
    
    let player = try engine.makePlayer(with: CHHapticPattern(expoObject: expoPattern))
    try player.start(atTime: CHHapticTimeImmediate)
  }
}

// MARK: - Apply Settings

extension TiFHapticsEngine {
  public func apply(settings: HapticsSettings) throws {
    let engine = try self.hapticsEngine()
    engine.isMutedForAudio = !settings.isAudioEnabled
    engine.isMutedForHaptics = !settings.isFeedbackEnabled
  }
}

// MARK: - Helpers

extension TiFHapticsEngine {
  private func hapticsEngine() throws -> SendableCHHapticEngine {
    if let hapticEngine {
      return hapticEngine
    }
    let engine = try SendableCHHapticEngine.autoResetting()
    self.hapticEngine = engine
    return engine
  }
}

// MARK: - SendableCHHapticEngine

// NB: Per Apple Docs, CHHapticEngine is thread-safe.
private final class SendableCHHapticEngine: CHHapticEngine, @unchecked Sendable {
  fileprivate static func autoResetting() throws -> SendableCHHapticEngine {
    let engine = try SendableCHHapticEngine()
    engine.isAutoShutdownEnabled = true
    engine.resetHandler = { [weak engine] in try? engine?.start() }
    return engine
  }
}
