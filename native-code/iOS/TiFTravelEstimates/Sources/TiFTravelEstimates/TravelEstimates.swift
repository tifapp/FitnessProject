import Foundation
import MapKit

/// A type containing estimates for all route types.
public struct TravelEstimates: Hashable, Sendable {
  public let walking: TravelEstimate?
  public let transit: TravelEstimate?
  public let automobile: TravelEstimate?
  
  public init(
    walking: TravelEstimate?,
    transit: TravelEstimate?,
    automobile: TravelEstimate?
  ) {
    self.walking = walking
    self.transit = transit
    self.automobile = automobile
  }
}

// MARK: - TravelEstimates Expo Object

extension TravelEstimates {
  public var expoObject: ExpoObject {
    [
      "walking": self.walking?.expoObject,
      "publicTransportation": self.transit?.expoObject,
      "automobile": self.automobile?.expoObject
    ]
  }
}

// MARK: - Points

/// The source and destination coordinates for a ``TravelEstimates`` instance.
public struct TravelEstimatesPoints: Hashable, Sendable {
  public let source: LocationCoordinate2D
  public let destination: LocationCoordinate2D
  
  public init(
    source: LocationCoordinate2D,
    destination: LocationCoordinate2D
  ) {
    self.source = source
    self.destination = destination
  }
}

// MARK: - Points Mocks

extension TravelEstimatesPoints {
  public static let treasureIsland = Self(
    source: LocationCoordinate2D(
      latitude: 37.82964,
      longitude: -122.36880
    ),
    destination: LocationCoordinate2D(
      latitude: 37.81938,
      longitude: -122.36426
    )
  )
}

// MARK: - Estimate Data

/// An estimate from a single travel route calculation.
public struct TravelEstimate: Sendable, Hashable {
  public let travelDistanceMeters: Double
  public let expectedTravelSeconds: TimeInterval
  
  public init(
    travelDistanceMeters: Double,
    expectedTravelSeconds: TimeInterval
  ) {
    self.travelDistanceMeters = travelDistanceMeters
    self.expectedTravelSeconds = expectedTravelSeconds
  }
}

// MARK: - TravelEstimate Expo Object

extension TravelEstimate {
  fileprivate var expoObject: ExpoObject {
    [
      "travelDistanceMeters": self.travelDistanceMeters,
      "expectedTravelSeconds": self.expectedTravelSeconds
    ]
  }
}

// MARK: - Route Type

/// All suported methods of travel for calculating estimates.
public enum TravelEstimateRouteType: Sendable, Hashable {
  case automobile
  case transit
  case walking
}

// MARK: - MKDirections.Request

extension MKDirections.Request {
  public convenience init(
    points: TravelEstimatesPoints,
    for routeType: TravelEstimateRouteType
  ) {
    self.init()
    self.source = MKMapItem(coordinate: points.source)
    self.destination = MKMapItem(coordinate: points.destination)
    self.transportType = routeType.transportType
  }
}

extension TravelEstimateRouteType {
  fileprivate var transportType: MKDirectionsTransportType {
    switch self {
    case .automobile: .automobile
    case .transit: .transit
    case .walking: .walking
    }
  }
}
