// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
  name: "TiFNative",
  platforms: [.iOS(.v13)],
  products: [
    .library(name: "TiFNative", targets: ["TiFNative"])
  ],
  targets: [
    .target(name: "TiFNative"),
    .testTarget(
      name: "TiFNativeTests",
      dependencies: ["TiFNative"]
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
