import XCTest
import TiFNative
import MapKit

final class MapKitTravelEstimatesTests: XCTestCase {
  func testReturnsAProperEstimateFor2NearbyPoints() async throws {
    let estimate = try await MKDirections.estimate(
      points: .treasureIsland,
      for: .automobile
    )
    let unwrappedEstimate = try XCTUnwrap(estimate)
    let roughlyOneMile = (1448.41..<1770.28)
    let roughly4Minutes = (220.0..<260.0)
    XCTAssertTrue(roughlyOneMile.contains(unwrappedEstimate.travelDistanceMeters))
    XCTAssertTrue(roughly4Minutes.contains(unwrappedEstimate.expectedTravelSeconds))
  }
  
  func testReturnsNilWhenNoRouteFound() async throws {
    let pacificOceanPoints = TravelEstimatesPoints(
      source: LocationCoordinate2D(
        latitude: 37.89677,
        longitude: -124.36819
      ),
      destination: LocationCoordinate2D(
        latitude: 37.84205,
        longitude: -124.37847
      )
    )
    let estimate = try await MKDirections.estimate(
      points: pacificOceanPoints,
      for: .automobile
    )
    XCTAssertNil(estimate)
  }
}
