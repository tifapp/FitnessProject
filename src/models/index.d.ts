import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";



export declare class Location {
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  constructor(init: ModelInit<Location>);
}

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
  readonly dummy?: number | null;
  readonly Accepted: number;
  constructor(init: ModelInit<Conversation>);
  static copyOf(source: Conversation, mutator: (draft: MutableModel<Conversation>) => MutableModel<Conversation> | void): Conversation;
}

export declare class Post {
  readonly id: string;
  readonly likes?: number | null;
  readonly replies?: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly userId: string;
  readonly description?: string | null;
  readonly channel?: string | null;
  readonly receiver?: string | null;
  readonly parentId?: string | null;
  readonly imageURL?: string | null;
  constructor(init: ModelInit<Post>);
  static copyOf(source: Post, mutator: (draft: MutableModel<Post>) => MutableModel<Post> | void): Post;
}

export declare class User {
  readonly id: string;
  readonly identityId?: string | null;
  readonly name: string;
  readonly age?: number | null;
  readonly gender?: string | null;
  readonly bio?: string | null;
  readonly goals?: string | null;
  readonly location?: Location | null;
  readonly status?: string | null;
  readonly deviceToken?: string | null;
  readonly friendRequestPrivacy?: number | null;
  readonly messagesPrivacy?: number | null;
  readonly isVerified?: boolean | null;
  constructor(init: ModelInit<User>);
  static copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

export declare class Friendship {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly sender: string;
  readonly receiver: string;
  readonly accepted?: boolean | null;
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

export declare class Challenge {
  readonly id: string;
  readonly name: string;
  readonly Description: string;
  readonly open?: boolean | null;
  constructor(init: ModelInit<Challenge>);
  static copyOf(source: Challenge, mutator: (draft: MutableModel<Challenge>) => MutableModel<Challenge> | void): Challenge;
}

export declare class Group {
  readonly id: string;
  readonly userID: string;
  readonly name: string;
  readonly Privacy: string;
  readonly Sport: string;
  readonly Description: string;
  readonly characterCount?: number | null;
  readonly latitude?: number | null;
  constructor(init: ModelInit<Group>);
  static copyOf(source: Group, mutator: (draft: MutableModel<Group>) => MutableModel<Group> | void): Group;
}

export declare class Report {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly userId: string;
  readonly postId: string;
  readonly message?: string | null;
  constructor(init: ModelInit<Report>);
  static copyOf(source: Report, mutator: (draft: MutableModel<Report>) => MutableModel<Report> | void): Report;
}

export declare class Verification {
  readonly id: string;
  readonly title?: string | null;
  readonly isVerified?: boolean | null;
  constructor(init: ModelInit<Verification>);
  static copyOf(source: Verification, mutator: (draft: MutableModel<Verification>) => MutableModel<Verification> | void): Verification;
}