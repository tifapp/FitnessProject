import { Post } from "../src/models";
import PostItem from "@components/PostItem";
import { fireEvent, render, screen } from "@testing-library/react-native";
import useGenerateRandomColor from "@hooks/generateRandomColor";
import generateColor from "@hooks/generateRandomColor";

jest.mock('../src/models', () => {
  return {
    Post: jest.fn().mockImplementation(() => {
      return {
        id: '5',
        createdAt: "2023-01-23T06:35:53.184Z",
        updatedAt: "2023-01-29T01:42:01.713Z",
        userId: "078ff5c0-5bce-4603-b1f3-79cf8258ec26",
        description: "mockDescription",
        channel: "general"
      }
    })
  }
});

jest.mock('@hooks/generateRandomColor', () => {
  return 'blue'
});

//jest.mock('../foo'); // this happens automatically with automocking
//const foo = require('../foo');

globalThis.savedUsers["078ff5c0-5bce-4603-b1f3-79cf8258ec26"] = {
  name: "Post Test",
  isVerified: true
}

const mockedNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockedNavigate
  })
}));



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
    render(<PostItem item={post} likes={0} reportPost={mockReportPost}
      writtenByYou={false} operations={mockOps} startTime={time}
      maxOccupancy={8} hasInvitations={true}
    />);
    
    expect(screen.getByText(props.description)).toBeDefined();
    expect(screen.getByLabelText('time until')).toBeDefined();
    expect(screen.getByLabelText('max occupancy')).toBeDefined();
    expect(screen.getByLabelText('request invitations')).toBeDefined();
  });

  it("Renders with only time until event starts", () => {
    render(<PostItem item={post} likes={0} reportPost={mockReportPost}
      writtenByYou={false} operations={mockOps} startTime={time}
      maxOccupancy={undefined} hasInvitations={false}
    />);
    
    expect(screen.getByText(props.description)).toBeDefined();
    expect(screen.queryByLabelText('time until')).toBeDefined();
    expect(screen.queryByLabelText('max occupancy')).toBeNull();
    expect(screen.queryByLabelText('request invitations')).toBeNull();
  });

  it("Renders with only max occupancy", () => {
    render(<PostItem item={post} likes={0} reportPost={mockReportPost}
      writtenByYou={false} operations={mockOps} startTime={undefined}
      maxOccupancy={8} hasInvitations={false}
    />);
    
    expect(screen.getByText(props.description)).toBeDefined();
    expect(screen.queryByLabelText('time until')).toBeNull();
    expect(screen.queryByLabelText('max occupancy')).toBeDefined();
    expect(screen.queryByLabelText('request invitations')).toBeNull();
  });

  it("Renders with only invitations", () => {
    render(<PostItem item={post} likes={0} reportPost={mockReportPost}
      writtenByYou={false} operations={mockOps} startTime={undefined}
      maxOccupancy={undefined} hasInvitations={true}
    />);
    
    expect(screen.getByText(props.description)).toBeDefined();
    expect(screen.queryByLabelText('time until')).toBeNull();
    expect(screen.queryByLabelText('max occupancy')).toBeNull();
    expect(screen.queryByLabelText('request invitations')).toBeDefined();
  });

  it("Name is shortened", () => {
    render(<PostItem item={post} likes={0} reportPost={mockReportPost}
      writtenByYou={false} operations={mockOps} startTime={time}
      maxOccupancy={8} hasInvitations={true}
    />);
    
    expect(screen.getByText("Post T.")).toBeDefined();
  });

  it("Color of invitation changes on click", () => {
    render(<PostItem item={post} likes={0} reportPost={mockReportPost}
      writtenByYou={false} operations={mockOps} startTime={undefined}
      maxOccupancy={undefined} hasInvitations={true}
    />);
    const invitation = screen.queryByLabelText('invitation icon');

    expect(invitation.props.style[0].color).toEqual("black");
    fireEvent.press(invitation);
    expect(invitation.props.style[0].color).toEqual(generateColor);
  });
/*
  it("Time becomes red", () => {
    render(<PostItem item={post} likes={0} reportPost={mockReportPost}
      writtenByYou={false} operations={mockOps} startTime={1}
      maxOccupancy={8} hasInvitations={true}
    />);
    
    expect(screen.getByText("Post T.")).toBeDefined();
  });*/
});