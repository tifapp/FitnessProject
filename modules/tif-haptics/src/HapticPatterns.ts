export const createHeartbeatPattern = () => {
  return {
    events: [
      {
        eventType: "hapticTransient",
        relativeTime: 0,
        parameters: [
          { parameterID: "hapticIntensity", value: 1.0 },
          { parameterID: "hapticSharpness", value: 0.5 }
        ]
      },
      {
        eventType: "hapticTransient",
        relativeTime: 0.2,
        parameters: [
          { parameterID: "hapticIntensity", value: 0.8 },
          { parameterID: "hapticSharpness", value: 0.4 }
        ]
      }
    ]
  }
}

export const createFadeOutPattern = () => {
  return {
    events: [
      {
        eventType: "hapticContinuous",
        relativeTime: 0.0,
        duration: 0.3,
        parameters: [
          { parameterID: "hapticIntensity", value: 0.5 },
          { parameterID: "hapticSharpness", value: 0.3 }
        ]
      },
      {
        eventType: "hapticContinuous",
        relativeTime: 0.3,
        duration: 0.3,
        parameters: [
          { parameterID: "hapticIntensity", value: 1.0 },
          { parameterID: "hapticSharpness", value: 0.6 }
        ]
      },
      {
        eventType: "hapticContinuous",
        relativeTime: 0.6,
        duration: 0.2,
        parameters: [
          { parameterID: "hapticIntensity", value: 0.5 },
          { parameterID: "hapticSharpness", value: 0.4 }
        ]
      },
      {
        eventType: "hapticContinuous",
        relativeTime: 0.8,
        duration: 0.2,
        parameters: [
          { parameterID: "hapticIntensity", value: 0.2 },
          { parameterID: "hapticSharpness", value: 0.2 }
        ]
      }
    ]
  }
}

export const createRoarPattern = () => {
  return {
    events: [
      {
        eventType: "hapticContinuous",
        relativeTime: 0.5,
        duration: 0.4,
        parameters: [
          { parameterID: "hapticIntensity", value: 0.2 },
          { parameterID: "hapticSharpness", value: 0.1 }
        ]
      },
      {
        eventType: "hapticContinuous",
        relativeTime: 0.9,
        duration: 0.3,
        parameters: [
          { parameterID: "hapticIntensity", value: 1.0 },
          { parameterID: "hapticSharpness", value: 0.6 }
        ]
      },
      {
        eventType: "hapticContinuous",
        relativeTime: 1.2,
        duration: 0.3,
        parameters: [
          { parameterID: "hapticIntensity", value: 0.5 },
          { parameterID: "hapticSharpness", value: 0.4 }
        ]
      },
      {
        eventType: "hapticContinuous",
        relativeTime: 1.5,
        duration: 0.2,
        parameters: [
          { parameterID: "hapticIntensity", value: 0.2 },
          { parameterID: "hapticSharpness", value: 0.2 }
        ]
      }
    ]
  }
}

export const createThudPattern = () => {
  return {
    events: [
      {
        eventType: "hapticTransient",
        relativeTime: 0.0,
        parameters: [
          { parameterID: "hapticIntensity", value: 1.0 },
          { parameterID: "hapticSharpness", value: 0.8 }
        ]
      },
      {
        eventType: "hapticContinuous",
        relativeTime: 0.05,
        duration: 0.2,
        parameters: [
          { parameterID: "hapticIntensity", value: 0.3 },
          { parameterID: "hapticSharpness", value: 0.2 }
        ]
      }
    ]
  }
}
