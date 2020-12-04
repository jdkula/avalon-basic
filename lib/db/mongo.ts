import { MongoClient } from 'mongodb';
import { RoleName } from '../roles';

const client = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const mongo = client.connect().then((mongo) => mongo.db('avalonbasic'));

export default mongo;

export interface Player {
    name: string;
    role: RoleName;
    vote: boolean | null;
}

export interface GamePreStart {
    status: 'prestart';
    _id: string;
    players: Pick<Player, 'name'>[];
}

export interface GamePostStart {
    status: 'poststart';
    _id: string;
    voting: null | 'public' | 'private';
    players: Player[];
}

export type GameStatus = GamePreStart | GamePostStart;

export const collections = mongo.then((db) => ({
    games: db.collection<GameStatus>('games'),
}));
