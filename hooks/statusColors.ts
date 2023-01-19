const StatusColors = {
  None: "gray",
  Networker: "red",
  "Workout Partner": "gold",
  "Sports Player": "green",
  Trainee: "blue",
  Trainer: "purple",
  "Health Professional": "black",
};

export default StatusColors;

export type Status = keyof typeof StatusColors;