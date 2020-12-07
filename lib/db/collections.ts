import { Collection, Db, MongoClient } from 'mongodb';
import { NextApiRequest } from 'next';
import { AvalonRequest } from './middleware';
import { GameStatus } from './models';
import { mongoClient } from './mongo';

export interface Collections {
    games: Collection<GameStatus>;
}

export default async function database(): Promise<Collections>;
export default async function database(req: AvalonRequest, res: NextApiRequest, next: () => never): Promise<never>;
export default async function database(
    req?: AvalonRequest,
    res?: NextApiRequest,
    next?: () => never,
): Promise<Collections | never> {
    if (!mongoClient.isConnected()) await mongoClient.connect();

    const dbRaw = mongoClient.db('avalonbasic');
    const collections = {
        games: dbRaw.collection<GameStatus>('games'),
    };

    if (req && res && next) {
        // Middleware base
        req.dbClient = mongoClient;
        req.dbRaw = dbRaw;
        req.db = collections;
        return next();
    } else {
        return collections;
    }
}
