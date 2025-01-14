import MapKit

/// An actor that manages simultaneous requests for travel estimates.
public final actor TravelEstimatesActor {
  public typealias PerformEstimation = @Sendable (
    TravelEstimatesPoints,
    TravelEstimateRouteType
  ) async throws -> TravelEstimate?
  
  private let estimate: PerformEstimation
  private var estimations = [TravelEstimatesPoints: Task<TravelEstimates, any Error>]()
  
  public init(estimate: @escaping PerformEstimation) {
    self.estimate = estimate
  }
  
  /// Returns a ``TravelEstimates`` instance for the given points.
  public func estimates(
    for points: TravelEstimatesPoints
  ) async throws -> TravelEstimates {
    if let estimation = self.estimations[points] {
      return try await estimation.value
    }
    let estimation = Task {
      async let walking = self.estimate(points, .walking)
      async let transit = self.estimate(points, .transit)
      async let automobile = self.estimate(points, .automobile)
      let estimates = TravelEstimates(
        walking: try await walking,
        transit: try await transit,
        automobile: try await automobile
      )
      self.estimations.removeValue(forKey: points)
      return estimates
    }
    self.estimations[points] = estimation
    return try await estimation.value
  }
  
  /// Cancels the task for an ongoing estimation for the given points.
  ///
  /// This will cause the associated ``estimates(for:)`` call to throw a
  /// ``CancellationError``.
  public func cancelEstimation(for points: TravelEstimatesPoints) {
    self.estimations[points]?.cancel()
    self.estimations.removeValue(forKey: points)
  }
}

// MARK: - Shared Instance

extension TravelEstimatesActor {
  public static let shared = TravelEstimatesActor {
    try await MKDirections.estimate(points: $0, for: $1)
  }
}
