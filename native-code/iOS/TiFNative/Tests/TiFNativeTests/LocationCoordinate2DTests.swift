import XCTest
import TiFTravelEstimates

final class LocationCoordinate2DTests: XCTestCase {
  func testFromExpoObjectBasic() throws {
    let coordinate = try LocationCoordinate2D(
      expoObject: [
        "latitude": 47.1234,
        "longitude": -121.1234
      ]
    )
    let expected = LocationCoordinate2D(latitude: 47.1234, longitude: -121.1234)
    XCTAssertEqual(coordinate, expected)
  }
  
  func testFromExpoObjectThrowsWhenInvalid() throws {
    XCTAssertThrowsError(
      try LocationCoordinate2D(expoObject: ["longitude": -121.1234])
    )
    
    XCTAssertThrowsError(
      try LocationCoordinate2D(expoObject: ["latitude": 41.1234])
    )
    
    XCTAssertThrowsError(
      try LocationCoordinate2D(
        expoObject: ["longitude": "hello", "latitude": 41.1234]
      )
    )
  }
}
