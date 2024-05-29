import XCTest
import TiFNative

final class TravelEstimatesTests: XCTestCase {
  func testExpoObject() throws {
    let estimates = TravelEstimates(
      walking: nil,
      transit: TravelEstimate(
        travelDistanceMeters: 3,
        expectedTravelSeconds: 4
      ),
      automobile: TravelEstimate(
        travelDistanceMeters: 1,
        expectedTravelSeconds: 2
      )
    )
    
    let automobile = try XCTUnwrap(estimates.expoObject["automobile"] as? [String: Any])
    XCTAssertEqual(automobile["travelDistanceMeters"] as? Double, 1)
    XCTAssertEqual(automobile["expectedTravelSeconds"] as? Double, 2)
    
    let transit = try XCTUnwrap(estimates.expoObject["publicTransportation"] as? [String: Any])
    XCTAssertEqual(transit["travelDistanceMeters"] as? Double, 3)
    XCTAssertEqual(transit["expectedTravelSeconds"] as? Double, 4)
    
    let walking = try XCTUnwrap(estimates.expoObject["walking"])
    XCTAssertNil(walking as? [String: Any])
  }
}
