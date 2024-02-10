// TODO: - Could conversions be automated with Codable?

public typealias ExpoObject = [String: Any?]

// MARK: - Error

public enum ExpoObjectErrror: Error {
  case decoding
}
