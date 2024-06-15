import MapKit

extension MKDirections {
  /// A ``CancellableCompletionRequest`` for ETAs.
  public final class CancellableETARequest: CancellableCompletionRequest, @unchecked Sendable {
    let directions: MKDirections
    
    fileprivate init(directions: MKDirections) {
      self.directions = directions
    }
    
    public func perform(
      completion: @escaping (ETAResponse?, (Error)?) -> Void
    ) {
      self.directions.calculateETA(completionHandler: completion)
    }
    
    public func cancel() {
      self.directions.cancel()
    }
  }
  
  /// A ``CancellableCompletionRequest`` for ETAs.
  public var cancellableETARequest: CancellableETARequest {
    CancellableETARequest(directions: self)
  }
  
  /// Begins requesting the travel time information asynchronously whilst also
  /// participating in cooperative cancellation.
  public func estimateETA() async throws -> ETAResponse {
    try await self.cancellableETARequest.perform()
  }
}

// MARK: - Estimate Calculation

extension MKDirections {
  /// Attempts to estimate the travel estimate for the given points and
  /// route type.
  ///
  /// - Parameters:
  ///   - points: The source and destination points to compute an estimate for.
  ///   - routeType: The method of route transportation.
  /// - Returns: A ``TravelEstimate`` if available.
  public static func estimate(
    points: TravelEstimatesPoints,
    for routeType: TravelEstimateRouteType
  ) async throws -> TravelEstimate? {
    do {
      let request = MKDirections.Request(points: points, for: routeType)
      let eta = try await MKDirections(request: request).estimateETA()
      return TravelEstimate(
        travelDistanceMeters: eta.distance,
        expectedTravelSeconds: eta.expectedTravelTime
      )
    } catch (let error as MKError) {
      if error.code == .directionsNotFound || error.code == .placemarkNotFound {
        return nil
      }
      throw error
    }
  }
}
