export const createHeartbeatPattern = () => {
  return {
    events: [ // Changed from "Pattern" to "events"
      {
        eventType: 'hapticTransient', // Changed from "EventType" to "eventType"
        relativeTime: 0,               // Changed from "Time" to "relativeTime"
        parameters: [                  // Changed from "EventParameters" to "parameters"
          { parameterID: 'hapticIntensity', value: 1.0 }, // Changed from "ParameterID" and "Value" to "parameterID" and "value"
          { parameterID: 'hapticSharpness', value: 0.5 },
        ],
      },
      {
        eventType: 'hapticTransient',
        relativeTime: 0.2,
        parameters: [
          { parameterID: 'hapticIntensity', value: 0.8 },
          { parameterID: 'hapticSharpness', value: 0.4 },
        ],
      },
    ],
  };
};  