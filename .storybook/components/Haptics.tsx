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

export const createFadeOutPattern = () => {
  return {
    events: [
      {
        eventType: 'hapticContinuous', 
        relativeTime: 0.0,
        duration: 0.3, // Quick burst at the start
        parameters: [
          { parameterID: 'hapticIntensity', value: 0.5 }, // High intensity for a strong gust
          { parameterID: 'hapticSharpness', value: 0.3 }, // Moderate sharpness for a brisk effect
        ],
      },
      {
        eventType: 'hapticContinuous', 
        relativeTime: 0.3,
        duration: 0.3, // Quick burst at the start
        parameters: [
          { parameterID: 'hapticIntensity', value: 1.0 }, // High intensity for a strong gust
          { parameterID: 'hapticSharpness', value: 0.6 }, // Moderate sharpness for a brisk effect
        ],
      },
      {
        eventType: 'hapticContinuous',
        relativeTime: 0.6,
        duration: 0.2, // Quickly fades out
        parameters: [
          { parameterID: 'hapticIntensity', value: 0.5 }, // Decreasing intensity
          { parameterID: 'hapticSharpness', value: 0.4 },
        ],
      },
      {
        eventType: 'hapticContinuous',
        relativeTime: 0.8,
        duration: 0.2, // Final fade-off
        parameters: [
          { parameterID: 'hapticIntensity', value: 0.2 }, // Very low intensity to finish the effect
          { parameterID: 'hapticSharpness', value: 0.2 },
        ],
      },
    ],
  };
};

export const createRoarPattern = () => {
  return {
    events: [
      // Delay for half a second before the roar starts
      {
        eventType: 'hapticContinuous',
        relativeTime: 0.5, // Start after 0.5 seconds
        duration: 0.4,     // Gradual build-up for the roar
        parameters: [
          { parameterID: 'hapticIntensity', value: 0.2 }, // Start with low intensity
          { parameterID: 'hapticSharpness', value: 0.1 }, // Start with very low sharpness
        ],
      },
      {
        eventType: 'hapticContinuous',
        relativeTime: 0.9, // Continue the roar
        duration: 0.3,     // More intensity for the peak of the roar
        parameters: [
          { parameterID: 'hapticIntensity', value: 1.0 }, // Peak intensity
          { parameterID: 'hapticSharpness', value: 0.6 }, // Moderate sharpness to convey force
        ],
      },
      {
        eventType: 'hapticContinuous',
        relativeTime: 1.2, // Fade out the roar
        duration: 0.3,     // Gradual fade out
        parameters: [
          { parameterID: 'hapticIntensity', value: 0.5 }, // Decreasing intensity
          { parameterID: 'hapticSharpness', value: 0.4 }, // Slight decrease in sharpness
        ],
      },
      {
        eventType: 'hapticContinuous',
        relativeTime: 1.5, // Final fade-off
        duration: 0.2,     // End of the roar
        parameters: [
          { parameterID: 'hapticIntensity', value: 0.2 }, // Very low intensity to finish the roar
          { parameterID: 'hapticSharpness', value: 0.2 }, // Soft finish
        ],
      },
    ],
  };
};

export const createThudPattern = () => {
  return {
    events: [
      {
        eventType: 'hapticTransient', // Simulate the initial heavy impact
        relativeTime: 0.0,
        parameters: [
          { parameterID: 'hapticIntensity', value: 1.0 }, // Very high intensity to represent a strong impact
          { parameterID: 'hapticSharpness', value: 0.8 }, // Sharpness to make it feel like a solid, hard hit
        ],
      },
      {
        eventType: 'hapticContinuous', // Short fade-out after the impact
        relativeTime: 0.05, // Very brief delay after the initial thud
        duration: 0.2, // Quick fading
        parameters: [
          { parameterID: 'hapticIntensity', value: 0.3 }, // Rapid drop in intensity for the fade-out
          { parameterID: 'hapticSharpness', value: 0.2 }, // Softer finish to simulate a bounce or settling
        ],
      },
    ],
  };
};
