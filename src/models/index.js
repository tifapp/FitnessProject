// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Like, Conversation, Post, User, Friendship, Block, Challenge, Group, Report, Verification, Location } = initSchema(schema);

export {
  Like,
  Conversation,
  Post,
  User,
  Friendship,
  Block,
  Challenge,
  Group,
  Report,
  Verification,
  Location
};