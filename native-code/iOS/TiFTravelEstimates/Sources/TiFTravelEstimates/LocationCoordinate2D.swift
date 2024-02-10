import MapKit

/// A location coordinate type that's both ``Sendable`` and ``Hashable``.
public struct LocationCoordinate2D: Sendable, Hashable {
  public let latitude: Double
  public let longitude: Double
  
  public init(latitude: Double, longitude: Double) {
    self.latitude = latitude
    self.longitude = longitude
  }
}

// MARK: - Expo Object

extension LocationCoordinate2D {
  public init(expoObject: ExpoObject) throws {
    let latitude = expoObject["latitude"] as? Double
    let longitude = expoObject["longitude"] as? Double
    guard let latitude, let longitude else { throw ExpoObjectErrror.decoding }
    self.init(latitude: latitude, longitude: longitude)
  }
}

// MARK: - Mocks

extension LocationCoordinate2D {
  public static let newYork = Self(
    latitude: 40.7127,
    longitude: -74.0059
  )
  
  public static let sanfrancisco = Self(
    latitude: 37.783333,
    longitude: -122.416667
  )
}

// MARK: - MKMapItem

extension MKMapItem {
  public convenience init(coordinate: LocationCoordinate2D) {
    self.init(
      placemark: MKPlacemark(
        coordinate: CLLocationCoordinate2D(
          latitude: coordinate.latitude,
          longitude: coordinate.longitude
        )
      )
    )
  }
}
