import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class Like {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly userId: string;
  readonly postId: string;
  constructor(init: ModelInit<Like>);
  static copyOf(source: Like, mutator: (draft: MutableModel<Like>) => MutableModel<Like> | void): Like;
}

export declare class Conversation {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly users: string[];
  readonly lastUser: string;
  readonly lastMessage: string;
  readonly dummy?: number;
  constructor(init: ModelInit<Conversation>);
  static copyOf(source: Conversation, mutator: (draft: MutableModel<Conversation>) => MutableModel<Conversation> | void): Conversation;
}

export declare class Post {
  readonly id: string;
  readonly likes?: number;
  readonly replies?: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly userId: string;
  readonly description?: string;
  readonly channel?: string;
  readonly receiver?: string;
  readonly parentId?: string;
  constructor(init: ModelInit<Post>);
  static copyOf(source: Post, mutator: (draft: MutableModel<Post>) => MutableModel<Post> | void): Post;
}

export declare class Friendship {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly sender: string;
  readonly receiver: string;
  readonly accepted?: boolean;
  constructor(init: ModelInit<Friendship>);
  static copyOf(source: Friendship, mutator: (draft: MutableModel<Friendship>) => MutableModel<Friendship> | void): Friendship;
}

export declare class Block {
  readonly id: string;
  readonly createdAt: string;
  readonly userId: string;
  readonly blockee: string;
  constructor(init: ModelInit<Block>);
  static copyOf(source: Block, mutator: (draft: MutableModel<Block>) => MutableModel<Block> | void): Block;
}

export declare class Group {
  readonly id: string;
  readonly userID: string;
  readonly name: string;
  readonly Privacy: string;
  readonly Sport: string;
  readonly Description: string;
  readonly characterCount?: number;
  readonly latitude?: number;
  constructor(init: ModelInit<Group>);
  static copyOf(source: Group, mutator: (draft: MutableModel<Group>) => MutableModel<Group> | void): Group;
}

export declare class User {
  readonly id: string;
  readonly identityId?: string;
  readonly name: string;
  readonly age?: number;
  readonly gender?: string;
  readonly bio?: string;
  readonly goals?: string;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly deviceToken?: string;
  constructor(init: ModelInit<User>);
  static copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}