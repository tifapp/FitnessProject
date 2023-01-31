import { Post } from "../src/models";
import PostItem from "@components/PostItem";
import { APIListOperations } from "@components/APIList";
import { render, screen } from "@testing-library/react-native";
import { ModelInit } from "@aws-amplify/datastore";

const createPost = (channel: string, createdAt: string,
    description: string, imageURL: string, likes: number,
    parentId: string, receiver: string, replies: number,
    updatedAt: string, userId: string
  ) => {
  const object: ModelInit<Post, {}> = {
    channel: channel,
    createdAt: createdAt,
    description: description,
    imageURL: imageURL,
    likes: likes,
    parentId: parentId,
    receiver: receiver,
    replies: replies,
    updatedAt: updatedAt,
    userId: userId,
  };
  return new Post(object);
}

const ops: APIListOperations<Post> = {
  removeItem: function (): void {
    throw new Error("Function not implemented.");
  },
  replaceItem: function (newItem: Partial<Post>): void {
    throw new Error("Function not implemented.");
  }
};

const reportPost = (timestamp: string, author: string): Promise<any> => {
  throw new Error("Function not implemented.");
}

//jest.mock('@hooks/fetchName', () => ({fetchUserAsync: jest.fn()}));
/*const profile = ProfileImageAndName({
  userId: "id",
  isFullSize: false,
  hideAll: false,
  hideName: false,
  vertical: true,
  spaceAfterName: false
});*/

globalThis.savedUsers["id"] = {
  name: "User Test",
  isVerified: true
}

const renderPost = (item: Post, likes: number,
  reportPost: (timestamp: string, author: string) => Promise<any>,
  writtenByYou: boolean, operations: APIListOperations<Post>,
  timeUntil: number, maxOccupancy: number, hasInvitations: boolean
) => {
  render(<PostItem item={item} likes={likes} reportPost={reportPost}
    writtenByYou={writtenByYou} operations={operations} timeUntil={timeUntil}
    maxOccupancy={maxOccupancy} hasInvitations={hasInvitations} />)
}

describe("PostUI Component Tests", () => {
  it("renders", () => {
    const post = createPost("general", "2023-01-23T06:35:53.184Z",
      "Test", 'null', 0, 'null', 'null', 148, "2023-01-29T01:42:01.713Z",
      "078ff5c0-5bce-4603-b1f3-79cf8258ec26"
    );
    renderPost(post, 148, reportPost, true, ops, 1, 8, true);
    expect(screen.getByText("Feed")).toBeDefined();
  })
});