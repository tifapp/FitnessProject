// TypeScript interface for event data
interface SportEvent {
  id: string;
  title: string;
  sport: string;
  location: string;
  dateTime: string;
  duration: string;
  spotsTotal: number;
  spotsFilled: number;
  skillLevel: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  hostName: string;
  hostRating: number;
  imageUrl: string;
  description: string;
}

// Sample event data for orbit component
export const sampleEvents: SportEvent[] = [
  {
    id: "evt-001",
    title: "Morning Beach Volleyball",
    sport: "Volleyball",
    location: "Sunset Beach, Court 3",
    dateTime: "Today, 8:00 AM",
    duration: "2 hours",
    spotsTotal: 8,
    spotsFilled: 6,
    skillLevel: "All Levels",
    hostName: "Alex",
    hostRating: 4.8,
    imageUrl: "https://example.com/volleyball.jpg",
    description: "Casual beach volleyball game. We play for fun but still competitive. Bring water!"
  },
  {
    id: "evt-002",
    title: "Pickup Basketball Game",
    sport: "Basketball",
    location: "Downtown Rec Center",
    dateTime: "Today, 6:30 PM",
    duration: "1.5 hours",
    spotsTotal: 10,
    spotsFilled: 7,
    skillLevel: "Intermediate",
    hostName: "Marcus",
    hostRating: 4.9,
    imageUrl: "https://example.com/basketball.jpg",
    description: "Indoor 5v5 basketball. Looking for people who know the basics and can keep up."
  },
  {
    id: "evt-003",
    title: "Tennis Doubles Match",
    sport: "Tennis",
    location: "City Park Courts",
    dateTime: "Tomorrow, 4:00 PM",
    duration: "2 hours",
    spotsTotal: 4,
    spotsFilled: 3,
    skillLevel: "Intermediate",
    hostName: "Sarah",
    hostRating: 4.7,
    imageUrl: "https://example.com/tennis.jpg",
    description: "Looking for one more player for doubles. We're decent but not pros!"
  },
  {
    id: "evt-004",
    title: "Morning Trail Run",
    sport: "Running",
    location: "Forest Hills Trail",
    dateTime: "Saturday, 7:00 AM",
    duration: "1 hour",
    spotsTotal: 6,
    spotsFilled: 2,
    skillLevel: "All Levels",
    hostName: "Jamie",
    hostRating: 4.6,
    imageUrl: "https://example.com/running.jpg",
    description: "5-mile trail run at conversational pace. We wait for everyone at checkpoints."
  },
  {
    id: "evt-005",
    title: "Beginner Yoga in the Park",
    sport: "Yoga",
    location: "Greenway Park",
    dateTime: "Saturday, 9:00 AM",
    duration: "1 hour",
    spotsTotal: 12,
    spotsFilled: 8,
    skillLevel: "Beginner",
    hostName: "Mia",
    hostRating: 5.0,
    imageUrl: "https://example.com/yoga.jpg",
    description: "Relaxed outdoor yoga session perfect for beginners. Bring your own mat!"
  },
  {
    id: "evt-006",
    title: "Pickup Soccer Game",
    sport: "Soccer",
    location: "Community Field",
    dateTime: "Sunday, 2:00 PM",
    duration: "2 hours",
    spotsTotal: 14,
    spotsFilled: 9,
    skillLevel: "All Levels",
    hostName: "Diego",
    hostRating: 4.5,
    imageUrl: "https://example.com/soccer.jpg",
    description: "Casual soccer match. All skill levels welcome. We'll make balanced teams."
  },
  {
    id: "evt-007",
    title: "Evening Cycling Group",
    sport: "Cycling",
    location: "Riverside Path",
    dateTime: "Monday, 6:00 PM",
    duration: "1.5 hours",
    spotsTotal: 8,
    spotsFilled: 4,
    skillLevel: "Intermediate",
    hostName: "Chris",
    hostRating: 4.7,
    imageUrl: "https://example.com/cycling.jpg",
    description: "15-mile ride at moderate pace (~15mph). Helmet required."
  },
  {
    id: "evt-008",
    title: "Rock Climbing for Beginners",
    sport: "Rock Climbing",
    location: "Summit Climbing Gym",
    dateTime: "Tuesday, 7:00 PM",
    duration: "2 hours",
    spotsTotal: 6,
    spotsFilled: 3,
    skillLevel: "Beginner",
    hostName: "Taylor",
    hostRating: 4.9,
    imageUrl: "https://example.com/climbing.jpg",
    description: "Intro to indoor climbing. Equipment rental available. I'll teach basics!"
  },
  {
    id: "evt-009",
    title: "Badminton Doubles",
    sport: "Badminton",
    location: "Community Center",
    dateTime: "Wednesday, 5:30 PM",
    duration: "1.5 hours",
    spotsTotal: 4,
    spotsFilled: 2,
    skillLevel: "All Levels",
    hostName: "Lin",
    hostRating: 4.6,
    imageUrl: "https://example.com/badminton.jpg",
    description: "Looking for 2 more for doubles play. Rackets available to borrow."
  },
  {
    id: "evt-010",
    title: "Ultimate Frisbee Pickup",
    sport: "Ultimate Frisbee",
    location: "Memorial Field",
    dateTime: "Thursday, 5:00 PM",
    duration: "2 hours",
    spotsTotal: 14,
    spotsFilled: 8,
    skillLevel: "All Levels",
    hostName: "Jordan",
    hostRating: 4.8,
    imageUrl: "https://example.com/frisbee.jpg",
    description: "Casual yet competitive ultimate frisbee. We'll teach newcomers!"
  },
  {
    id: "evt-011",
    title: "Advanced Tennis Singles",
    sport: "Tennis",
    location: "Tennis Club",
    dateTime: "Friday, 4:00 PM",
    duration: "1.5 hours",
    spotsTotal: 2,
    spotsFilled: 1,
    skillLevel: "Advanced",
    hostName: "Rafa",
    hostRating: 4.9,
    imageUrl: "https://example.com/tennis-advanced.jpg",
    description: "Looking for a challenge! NTRP 4.5+ level preferred."
  },
  {
    id: "evt-012",
    title: "Golf Foursome",
    sport: "Golf",
    location: "Pines Golf Course",
    dateTime: "Saturday, 10:00 AM",
    duration: "4 hours",
    spotsTotal: 4,
    spotsFilled: 2,
    skillLevel: "Intermediate",
    hostName: "Mike",
    hostRating: 4.7,
    imageUrl: "https://example.com/golf.jpg",
    description: "18 holes of golf. Looking for players who know etiquette. ~90-100 average score."
  }
]

// Example usage with the VirtualizedOrbit component:

/*
const keyExtractor = (item: SportEvent) => item.id;

const renderItem = (item: SportEvent, position: PositionData, state: { swappedAt?: number }) => (
  <View
    style={{
      width: 120,
      height: 160,
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: 12,
      padding: 12,
      transform: [{ scale: position.scale }],
      opacity: position.opacity
    }}
  >
    <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
    <Text>{item.sport}</Text>
    <Text>{item.dateTime}</Text>
    <Text>Spots: {item.spotsFilled}/{item.spotsTotal}</Text>
  </View>
);

// In your component:
<VirtualizedOrbit
  data={sampleEvents}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  numberOfItems={8}
  orbitRadius={180}
  itemSize={60}
  tiltAngle={70}
  positionY={250}
  autoRotateSpeed={0.5}
  showOrbitTrace={true}
/>
*/
