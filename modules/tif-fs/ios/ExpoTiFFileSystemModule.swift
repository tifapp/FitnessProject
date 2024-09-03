import ExpoModulesCore
import Foundation
import Zip

public class ExpoTiFFileSystemModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoTiFFileSystem")
    
    let documentsDirectory = FileManager.default.urls(
      for: .documentDirectory,
      in: .userDomainMask
    )[0]
    var logsZipArchivePath = documentsDirectory
    let _ = logsZipArchivePath.appendPathComponent("logs-archive.zip")
    
    Constants([
      "LOGS_ZIP_ARCHIVE_PATH": logsZipArchivePath.absoluteString
    ])
    
    Function("logsDatabaseInfo") { () throws -> [String: Any]? in
      guard let filesystem = self.appContext?.fileSystem else { return nil }
      var logsURL = documentsDirectory
      logsURL.appendPathComponent("SQLite/logs")
      let result = filesystem.ensureDirExists(withPath: logsURL.absoluteString)
      if !result {
        os_log(.error, "Failed to ensure logs database directory.")
      }
      logsURL.appendPathComponent("logs.db")
      return ["path": logsURL.absoluteString, "databaseName": "logs/logs.db"]
    }
    
    AsyncFunction("zip") { (url: URL, destination: URL) in
      try await url.zipContents(to: destination)
    }
  }
}

// MARK: - Zip

extension URL {
  func zipContents(to destination: URL) async throws {
    try await withUnsafeThrowingContinuation { continuation in
      // NB: Use a queue to avoid starving the cooperative thread-pool.
      DispatchQueue.logsZipArchiveQueue.async {
        do {
          try Zip.zipFiles(
            paths: [self],
            zipFilePath: destination,
            password: nil,
            progress: nil
          )
          continuation.resume()
        } catch {
          continuation.resume(throwing: error)
        }
      }
    }
  }
}

extension DispatchQueue {
  fileprivate static let logsZipArchiveQueue = DispatchQueue(
    label: "com.logs.zip-archive-queue",
    qos: .utility,
    attributes: .concurrent
  )
}
