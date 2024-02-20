// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
  name: "TiFTravelEstimates",
  platforms: [.iOS(.v13)],
  products: [
    .library(name: "TiFTravelEstimates", targets: ["TiFTravelEstimates"])
  ],
  targets: [
    .target(name: "TiFTravelEstimates"),
    .testTarget(
      name: "TiFTravelEstimatesTests",
      dependencies: ["TiFTravelEstimates"]
    )
  ]
)

for target in package.targets {
  target.swiftSettings = target.swiftSettings ?? []
  target.swiftSettings?.append(
    .unsafeFlags([
      "-Xfrontend", "-warn-concurrency",
      "-Xfrontend", "-enable-actor-data-race-checks",
      "-enable-bare-slash-regex",
    ])
  )
}
