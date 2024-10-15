import ExpoModulesCore
import CoreHaptics

public class TifHapticsModule: Module {
  private var engine: TiFHapticsEngine?

  public func definition() -> ModuleDefinition {
    Name("TifHaptics")

    Constants([
      "IS_HAPTICS_SUPPORTED": CHHapticEngine.capabilitiesForHardware().supportsHaptics
    ])

    Function("mute") {
      try? self.hapticsEngine().mute()
    }

    Function("unmute") {
      try? self.hapticsEngine().unmute()
    }

    AsyncFunction("play") { (event: HapticEvent) async throws -> Void in
      try await self.hapticsEngine().play(event: event)
    }

    AsyncFunction("playCustomPattern") { (jsonPattern: String) async throws -> Void in
      try await self.hapticsEngine().playCustomPattern(jsonPattern: jsonPattern)
    }
  }

  private func hapticsEngine() throws -> TiFHapticsEngine {
    if let engine = engine {
      return engine
    }
    let engine = try TiFHapticsEngine()
    self.engine = engine
    return engine
  }
}

// MARK: - Helpers

extension HapticEvent: Enumerable {}
