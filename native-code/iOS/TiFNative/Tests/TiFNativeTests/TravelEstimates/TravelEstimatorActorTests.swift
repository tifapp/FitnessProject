import XCTest
import MapKit
import TiFNative

final class TravelEstimatorActorTests: XCTestCase {
  func testBasics() async throws {
    let estimatesActor = TravelEstimatesActor { _, routeType in
      switch routeType {
      case .automobile: TravelEstimate(travelDistanceMeters: 1, expectedTravelSeconds: 2)
      case .transit: TravelEstimate(travelDistanceMeters: 3, expectedTravelSeconds: 4)
      case .walking: TravelEstimate(travelDistanceMeters: 5, expectedTravelSeconds: 6)
      }
    }
    let estimates = try await estimatesActor.estimates(for: .treasureIsland)
    XCTAssertEqual(
      estimates,
      TravelEstimates(
        walking: TravelEstimate(travelDistanceMeters: 5, expectedTravelSeconds: 6),
        transit: TravelEstimate(travelDistanceMeters: 3, expectedTravelSeconds: 4),
        automobile: TravelEstimate(travelDistanceMeters: 1, expectedTravelSeconds: 2)
      )
    )
  }
  
  func testMergesSimultaneousRequestsForSamePoints() async throws {
    let expectation = self.expectation(description: "makes 3 individual route requests")
    expectation.expectedFulfillmentCount = 3
    let estimatesActor = TravelEstimatesActor { _, _ in
      expectation.fulfill()
      return TravelEstimate(travelDistanceMeters: 1, expectedTravelSeconds: 2)
    }
    async let estimates1 = estimatesActor.estimates(for: .treasureIsland)
    async let estimates2 = estimatesActor.estimates(for: .treasureIsland)
    let e1 = try await estimates1
    let e2 = try await estimates2
    XCTAssertEqual(e1, e2)
    await self.fulfillment(of: [expectation], timeout: 0)
  }
  
  @available(iOS 16, *)
  func testCancellation() async throws {
    let expectation = self.expectation(description: "starts task")
    expectation.expectedFulfillmentCount = 3
    let estimatesActor = TravelEstimatesActor { _, _ in
      expectation.fulfill()
      let neverStream = AsyncStream<TravelEstimate?> { _ in }
      for await estimate in neverStream {
        return estimate
      }
      throw CancellationError()
    }
    let task = Task { _ = try await estimatesActor.estimates(for: .treasureIsland) }
    await self.fulfillment(of: [expectation], timeout: 0.05)
    await estimatesActor.cancelEstimation(for: .treasureIsland)
    do {
      _ = try await task.value
      XCTFail("should throw")
    } catch {
      XCTAssertTrue(error is CancellationError)
    }
  }
}
