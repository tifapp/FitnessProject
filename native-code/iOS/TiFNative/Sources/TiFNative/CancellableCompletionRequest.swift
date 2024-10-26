// MARK: - CancellableCompletionRequest

/// A protocol for some type that exposes asynchronous functionallity through
/// a completion handler, and also includes a method to cancel the asynchronous
/// work.
///
/// This is mainly needed because the async-await methods swift that generates
/// for these completion handlers don't participate in cooperative cancellation.
public protocol CancellableCompletionRequest<CompletionValue> {
  associatedtype CompletionValue
  func perform(
    completion: @Sendable @escaping (CompletionValue?, (any Error)?) -> Void
  )
  func cancel()
}

// MARK: - Perform

extension CancellableCompletionRequest where Self: AnyObject & Sendable, CompletionValue: Sendable {
  /// Performs this request and returns the result of the request.
  ///
  /// - Returns: A `CompletionValue`.
  public func perform() async throws -> CompletionValue {
    // NB: An AsyncStream must be used over an Unsafe/CheckedContinuation
    // since the latter does not participate in cooperative cancellation.
    let output = try await AsyncThrowingStream(
      bufferingPolicy: .bufferingNewest(0)
    ) { continuation in
      self.perform { output, error in
        if let output {
          continuation.yield(output)
          continuation.finish()
        } else {
          continuation.finish(throwing: error)
        }
      }
      continuation.onTermination = { @Sendable [weak self] _ in
        self?.cancel()
      }
    }
    .first(where: { _ in true })
    guard let output else { throw CancellationError() }
    return output
  }
}
