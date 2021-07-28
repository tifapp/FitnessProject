// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Like, Conversation, Post, Friendship, Block, Group, User } = initSchema(schema);

export {
  Like,
  Conversation,
  Post,
  Friendship,
  Block,
  Group,
  User
};