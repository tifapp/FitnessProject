import ExpoModulesCore
import CoreHaptics
import TiFNative

public class TifHapticsModule: Module {
  private let engine = TiFHapticsEngine()

  public func definition() -> ModuleDefinition {
    Name("TifHaptics")
    
    Function("deviceSupport") {
      let capabilities = CHHapticEngine.capabilitiesForHardware()
      return [
        "isFeedbackSupportedOnDevice": capabilities.supportsHaptics,
        "isAudioSupportedOnDevice": capabilities.supportsAudio
      ]
    }

    AsyncFunction("apply") { (settings: ExpoObject) async throws -> Void in
      let settings = try HapticsSettings(expoObject: settings)
      try await self.engine.apply(settings: settings)
    }

    AsyncFunction("play") { (event: ExpoObject) async throws -> Void in
      try await self.engine.play(expoPattern: event)
    }
  }
}
