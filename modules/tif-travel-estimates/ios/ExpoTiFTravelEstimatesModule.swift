import ExpoModulesCore
import TiFTravelEstimates

public class ExpoTiFTravelEstimatesModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoTiFTravelEstimates")

    AsyncFunction("travelEstimatesAsync") { (source: ExpoObject, destination: ExpoObject) async throws -> ExpoObject in
      let points = TravelEstimatesPoints(
        source: try LocationCoordinate2D(expoObject: source),
        destination: try LocationCoordinate2D(expoObject: destination)
      )
      return try await TravelEstimatesActor.shared
        .estimates(for: points)
        .expoObject
    }

    AsyncFunction("cancelTravelEstimatesAsync") { (source: ExpoObject, destination: ExpoObject) async throws -> Void in
      let points = TravelEstimatesPoints(
        source: try LocationCoordinate2D(expoObject: source),
        destination: try LocationCoordinate2D(expoObject: destination)
      )
      await TravelEstimatesActor.shared.cancelEstimation(for: points)
    }
  }
}
