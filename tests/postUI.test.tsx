import { Post } from "../src/models";
import { fireEvent, render, screen } from "@testing-library/react-native";
import EventItem from "@components/EventItem";

jest.mock('../src/models', () => {
  return {
    Post: jest.fn().mockImplementation(() => {
      return {
        id: '5',
        createdAt: "2023-01-23T06:35:53.184Z",
        updatedAt: "2023-01-29T01:42:01.713Z",
        userId: "078ff5c0-5bce-4603-b1f3-79cf8258ec26",
        description: "la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la la not shown",
        channel: "general"
      }
    })
  }
});

const mockedNavigate = jest.fn();

const mockGenerateColor: jest.MockedFunction<() => string> =
  jest.fn().mockImplementation(() => {
    return 'blue';
  });

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockedNavigate
  })
}));

globalThis.savedUsers["078ff5c0-5bce-4603-b1f3-79cf8258ec26"] = {
  name: "Post Test",
  isVerified: true
}

describe("PostUI Component Tests", () => {
  const props = {
    id: '5',
    createdAt: "2023-01-23T06:35:53.184Z",
    updatedAt: "2023-01-29T01:42:01.713Z",
    userId: "078ff5c0-5bce-4603-b1f3-79cf8258ec26",
    description: "mockDescription",
    channel: "general"
  }
  const post: Post = new Post(props);
  const mockReportPost = jest.fn();
  const mockOps = {
    removeItem: jest.fn(),
    replaceItem: jest.fn()
  }
  const time = new Date();
  
  it("Renders with all options", () => {
    render(<EventItem item={post} writtenByYou={true} startTime={time}
      maxOccupancy={8} hasInvitations={true} eventColor={mockGenerateColor()} />)
    
    expect(screen.queryByLabelText('description')).toBeDefined();
    expect(screen.getByLabelText('time until')).toBeDefined();
    expect(screen.getByLabelText('max occupancy')).toBeDefined();
    expect(screen.getByLabelText('request invitations')).toBeDefined();
  });

  it("Renders with only time until event starts", () => {
    render(<EventItem item={post} writtenByYou={true} startTime={time}
      maxOccupancy={undefined} hasInvitations={false} eventColor={mockGenerateColor()} />)
    
    expect(screen.queryByLabelText('description')).toBeDefined();
    expect(screen.queryByLabelText('time until')).toBeDefined();
    expect(screen.queryByLabelText('max occupancy')).toBeNull();
    expect(screen.queryByLabelText('request invitations')).toBeNull();
  });

  it("Renders with only max occupancy", () => {
    render(<EventItem item={post} writtenByYou={true} startTime={undefined}
      maxOccupancy={8} hasInvitations={false} eventColor={mockGenerateColor()} />)
    
    expect(screen.queryByLabelText('description')).toBeDefined();
    expect(screen.queryByLabelText('time until')).toBeNull();
    expect(screen.queryByLabelText('max occupancy')).toBeDefined();
    expect(screen.queryByLabelText('request invitations')).toBeNull();
  });

  it("Renders with only invitations", () => {
    render(<EventItem item={post} writtenByYou={true} startTime={undefined}
      maxOccupancy={undefined} hasInvitations={true} eventColor={mockGenerateColor()} />)
    
    expect(screen.queryByLabelText('description')).toBeDefined();
    expect(screen.queryByLabelText('time until')).toBeNull();
    expect(screen.queryByLabelText('max occupancy')).toBeNull();
    expect(screen.queryByLabelText('request invitations')).toBeDefined();
  });

  it("Name is shortened", () => {
    render(<EventItem item={post} writtenByYou={true} startTime={time}
      maxOccupancy={8} hasInvitations={true} eventColor={mockGenerateColor()} />)
    
    expect(screen.getByText("Post T.")).toBeDefined();
  });

  it("Description is truncated", () => {
    render(<EventItem item={post} writtenByYou={true} startTime={undefined}
      maxOccupancy={0} hasInvitations={false} eventColor={mockGenerateColor()} />)

      expect(screen.queryByText("not shown")).toBeNull();
  });

  it("Color of invitation changes on click", () => {
    render(<EventItem item={post} writtenByYou={true} startTime={undefined}
      maxOccupancy={undefined} hasInvitations={true} eventColor={mockGenerateColor()} />)
    const invitation = screen.queryByLabelText('invitation icon');

    expect(invitation.props.style[0].color).toEqual("black");
    fireEvent.press(invitation);
    expect(invitation.props.style[0].color).toEqual(mockGenerateColor());
  });

  it("Time becomes red", () => {
    time.setMinutes(time.getMinutes() + 30);
    render(<EventItem item={post} writtenByYou={true} startTime={time}
      maxOccupancy={undefined} hasInvitations={false} eventColor={mockGenerateColor()} />)
    const timeIcon = screen.queryByLabelText('time icon');

    expect(timeIcon.props.style[0].color).toEqual("red");
  });

  it("Occupancy becomes red", () => {
    render(<EventItem item={post} writtenByYou={true} startTime={undefined}
      maxOccupancy={1} hasInvitations={false} eventColor={mockGenerateColor()} />)
    const timeIcon = screen.queryByLabelText('occupancy icon');

    expect(timeIcon.props.style[0].color).toEqual("red");
  });
});