import CoreHaptics

/// A haptic event that is playable by the app.
public enum HapticEvent: String, CaseIterable {
    /// Used for when the user changes the selection of an item in some menu (e.g., a form)
    case selection
}

// MARK: - Haptics engine

/// A class for playing haptics using CoreHaptics under the hood.
public final class TiFHapticsEngine: @unchecked Sendable {
    private let hapticEngine: CHHapticEngine // NB: - Per Apple docs, CoreHaptics is thread-safe
    
    // Mapping dictionaries
    private let eventTypeMap: [String: CHHapticEvent.EventType] = [
        "hapticTransient": .hapticTransient,
        "hapticContinuous": .hapticContinuous
        // Add other event types as necessary
    ]
    
    private let parameterIDMap: [String: CHHapticEvent.ParameterID] = [
        "hapticSharpness": .hapticSharpness,
        "hapticIntensity": .hapticIntensity
        // Add other parameter IDs as necessary
    ]
    
    public init() throws {
        self.hapticEngine = try .createTiFInstance()
    }
    
    public func playCustomPattern(jsonPattern: String) async throws {
        try await self.hapticEngine.start()
        
        // Parse JSON into a dictionary
        guard let data = jsonPattern.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data, options: []),
              let patternDict = json as? [String: Any],
              let eventsArray = patternDict["events"] as? [[String: Any]] else {
            throw NSError(domain: "TifHaptics", code: 1001, userInfo: [NSLocalizedDescriptionKey: "Invalid JSON structure."])
        }
        
        var hapticEvents: [CHHapticEvent] = []
        
        for eventDict in eventsArray {
            // Parse event type using the mapping dictionary
            guard let eventTypeString = eventDict["eventType"] as? String,
                  let eventType = eventTypeMap[eventTypeString] else {
                print("Invalid or unsupported event type: \(String(describing: eventDict["eventType"]))")
                continue
            }
            
            // Parse relative time
            guard let relativeTime = eventDict["relativeTime"] as? TimeInterval else {
                print("Missing or invalid relativeTime in event: \(eventDict)")
                continue
            }
            
            // Parse parameters
            let parametersArray = eventDict["parameters"] as? [[String: Any]] ?? []
            var eventParameters: [CHHapticEventParameter] = []
            
            for paramDict in parametersArray {
                if let parameterIDString = paramDict["parameterID"] as? String,
                   let value = paramDict["value"] as? Float,
                   let parameterID = parameterIDMap[parameterIDString] {
                    eventParameters.append(CHHapticEventParameter(parameterID: parameterID, value: value))
                } else {
                    print("Invalid parameter in event: \(paramDict)")
                }
            }
            
            // Create CHHapticEvent
            let hapticEvent = CHHapticEvent(eventType: eventType, parameters: eventParameters, relativeTime: relativeTime)
            hapticEvents.append(hapticEvent)
        }
        
        // Create the haptic pattern with parsed events
        let pattern = try CHHapticPattern(events: hapticEvents, parameters: [])
        
        // Play the pattern
        try self.play(pattern: pattern)
    }
    
    public func play(event: HapticEvent) async throws {
        try await self.hapticEngine.start()
        
        switch event {
        case .selection:
            try self.playSelection()
        }
    }
    
    private func playSelection() throws {
        try self.play(
            pattern: CHHapticPattern(
                events: [
                    CHHapticEvent(
                        eventType: .hapticTransient,
                        parameters: [
                            CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.5),
                            CHHapticEventParameter(parameterID: .hapticIntensity, value: 0.5)
                        ],
                        relativeTime: 0 // Use 0 instead of CHHapticTimeImmediate for relativeTime
                    )
                ],
                parameters: []
            )
        )
    }
    
    private func play(pattern: CHHapticPattern) throws {
        let player = try self.hapticEngine.makePlayer(with: pattern)
        try player.start(atTime: 0) // Use 0 instead of CHHapticTimeImmediate
    }
    
    public func mute() {
        self.hapticEngine.isMutedForHaptics = true
    }
    
    public func unmute() {
        self.hapticEngine.isMutedForHaptics = false
    }
}

// MARK: - Helpers

extension CHHapticEngine {
    fileprivate static func createTiFInstance() throws -> CHHapticEngine {
        let engine = try CHHapticEngine()
        engine.isAutoShutdownEnabled = true
        engine.resetHandler = { [weak engine] in
            try? engine?.start()
        }
        return engine
    }
}
