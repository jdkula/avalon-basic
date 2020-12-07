import { MongoClient, Db } from 'mongodb';
import { NextApiRequest } from 'next';
import nextConnect from 'next-connect';
import database, { Collections } from './collections';

export interface AvalonRequest extends NextApiRequest {
    dbClient: MongoClient;
    dbRaw: Db;
    db: Collections;
}

const middleware = nextConnect();

middleware.use(database);

export default middleware;
