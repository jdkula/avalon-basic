import { MongoClient } from 'mongodb';
import { RoleName } from '../Roles';
import database from './collections';
import { GameStatus } from './models';

export const mongoClient = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
