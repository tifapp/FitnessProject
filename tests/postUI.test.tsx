import { Post } from "../src/models";
import PostItem from "@components/PostItem";
import { fireEvent, render, screen } from "@testing-library/react-native";
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

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockedNavigate
  })
}));

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
  
  it("renders", () => {
    render(<PostItem item={post} likes={0} reportPost={mockReportPost}
      writtenByYou={false} operations={mockOps} timeUntil={1}
      maxOccupancy={8} hasInvitations={true}
    />);
    
    expect(screen.getByText(props.description)).toBeDefined();
  });

  it("Name is shortened", () => {
    render(<PostItem item={post} likes={0} reportPost={mockReportPost}
      writtenByYou={false} operations={mockOps} timeUntil={1}
      maxOccupancy={8} hasInvitations={true}
    />);
    
    expect(screen.getByText("Post T.")).toBeDefined();
  });
});