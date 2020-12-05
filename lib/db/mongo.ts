import { MongoClient } from 'mongodb';
import { RoleName } from '../Roles';

const client = new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const mongo = client.connect().then((mongo) => mongo.db('avalonbasic'));

export default mongo;

export interface Player {
    name: string;
    role: RoleName;
    vote: boolean | null;
}

interface PlayerPreStart {
    name: string;
    role: null;
    vote: null;
}
export interface GamePreStart {
    status: 'prestart';
    _id: string;
    players: PlayerPreStart[];
    votingStatus: null;
    history: undefined[];
}

export interface Mission {
    team: string[];
    approved: string[];
    rejected: string[];
}

export interface Round {
    missions: Mission[];
    succeeded: string[];
    failed: string[];
}
export interface GamePostStart {
    status: 'poststart';
    _id: string;
    votingStatus: null | 'team' | 'mission' | 'public' | 'private';
    players: Player[];
    history: Round[];
}

export type GameStatus = GamePreStart | GamePostStart;

export const collections = mongo.then((db) => ({
    games: db.collection<GameStatus>('games'),
}));
