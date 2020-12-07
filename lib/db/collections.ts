import { Collection, Db, MongoClient } from 'mongodb';
import { NextApiRequest } from 'next';
import { AvalonRequest } from './middleware';
import { GameStatus } from './models';
import { mongoClient } from './mongo';

const connection: Promise<void> = (async () => {
    if (!mongoClient.isConnected()) await mongoClient.connect();
})();

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
    await connection;

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
