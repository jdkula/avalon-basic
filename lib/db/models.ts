import { RoleName } from '../Roles';

export interface Player {
    name: string;
    role: RoleName;
    vote: boolean | null;
    notes: string;
}

interface PlayerPreStart {
    name: string;
    role: null;
    vote: null;
    notes: string;
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
