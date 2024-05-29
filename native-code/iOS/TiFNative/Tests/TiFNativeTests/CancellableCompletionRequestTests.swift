import XCTest
import MapKit
import TiFTravelEstimates

final class CancellableCompletionRequestTests: XCTestCase {
  private final class TestRequest: CancellableCompletionRequest, Sendable {
    let expectation: XCTestExpectation?
    let directionsRequest: MKDirections.CancellableETARequest
    
    init(expectation: XCTestExpectation? = nil) {
      self.expectation = expectation
      let request = MKDirections.Request(points: .treasureIsland, for: .transit)
      self.directionsRequest = MKDirections(request: request)
        .cancellableETARequest
    }
    
    func perform(
      completion: @escaping @Sendable (MKDirections.ETAResponse?, (Error)?) -> Void
    ) {
      self.directionsRequest.perform { eta, error in
        self.expectation?.fulfill()
        completion(eta, error)
      }
    }
    
    func cancel() {
      self.directionsRequest.cancel()
    }
  }
  
  func testNoCancelReturnsResponseOfRequest() async throws {
    let expectation = self.expectation(description: "responds to request")
    let request = TestRequest(expectation: expectation)
    Task { _ = try await request.perform() }
    await self.fulfillment(of: [expectation])
  }
  
  @available(iOS 16, *)
  func testCancelDoesNotReturnResponseOfRequest() async throws {
    let expectation = self.expectation(description: "does not respond")
    expectation.isInverted = true
    let request = TestRequest(expectation: expectation)
    let task = Task { _ = try await request.perform() }
    // NB: Give time for the request to actually start.
    try await Task.sleep(for: .seconds(0.1))
    task.cancel()
    await self.fulfillment(of: [expectation], timeout: 1)
  }
  
  @available(iOS 16, *)
  func testThrowsWhenCancelled() async throws {
    let request = TestRequest()
    let task = Task { _ = try await request.perform() }
    // NB: Give time for the request to actually start.
    try await Task.sleep(for: .seconds(0.1))
    task.cancel()
    do {
      try await task.value
      XCTFail("Should Throw")
    } catch {
      XCTAssertTrue(error is CancellationError)
    }
  }
}
