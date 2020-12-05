import Axios from 'axios';
import { mutate } from 'swr';
import { collections, GamePostStart, GamePreStart, GameStatus, Mission, Player, Round } from './db/mongo';
import GameSettings from './GameSettings';
import Roles, { Role, RoleName } from './Roles';

export default class Game {
    private readonly _game: GamePostStart;
    private readonly _playerName?: string;
    constructor(game: GamePostStart, playerName?: string) {
        this._game = JSON.parse(JSON.stringify(game));
        this._playerName = playerName;
    }

    get root(): GamePostStart {
        return this._game;
    }

    private get my(): Player {
        return this._game.players.find((p) => p.name === this._playerName);
    }

    get myRole(): Role {
        return Roles.get(this.my.role);
    }

    get players(): string[] {
        return this._game.players.map((p) => p.name);
    }

    get roles(): Set<RoleName> {
        return new Set(this._game.players.map((p) => p.role));
    }

    get yesVotes(): string[] {
        return this._game.players.filter((p) => p.vote === true && this.allowedVoters.has(p.name)).map((p) => p.name);
    }

    get noVotes(): string[] {
        return this._game.players.filter((p) => p.vote === false && this.allowedVoters.has(p.name)).map((p) => p.name);
    }

    get voters(): string[] {
        return this._game.players.filter((p) => p.vote !== null && this.allowedVoters.has(p.name)).map((p) => p.name);
    }

    get nonVoters(): string[] {
        return this._game.players.filter((p) => p.vote === null && this.allowedVoters.has(p.name)).map((p) => p.name);
    }

    get leader(): string {
        const turnNumber = this._game.history.reduce((total, round) => total + round.missions.length, 0);
        if (turnNumber === 0) throw new Error('Should never have zero turns on a started game!');
        return this.players[(turnNumber - 1) % this.players.length];
    }

    get currentRound(): Round {
        return this._game.history[this._game.history.length - 1] ?? null;
    }

    get currentRoundNumber(): number {
        return this._game.history.length;
    }

    get currentMission(): Mission {
        return this.currentRound.missions[this.currentRound.missions.length - 1];
    }

    get team(): string[] {
        return this.currentMission.team ?? null;
    }

    get votesShown(): false | 'public' | 'private' {
        if (this._game.votingStatus === 'public' || this._game.votingStatus === 'private') {
            return this._game.votingStatus;
        }
        return false;
    }

    get voting(): false | 'mission' | 'team' {
        if (this._game.votingStatus === 'mission' || this._game.votingStatus === 'team') {
            return this._game.votingStatus;
        }
        return false;
    }

    get allowedVoters(): Set<string> {
        if (this._game.votingStatus === 'team') {
            return new Set(this.players);
        }
        if (this._game.votingStatus === 'mission') {
            return new Set(this.team ?? []);
        }
        return new Set();
    }

    get canVote(): boolean {
        if (!this._playerName) throw new Error('No player name specified');
        return this.allowedVoters.has(this._playerName);
    }

    get myVote(): boolean | null | undefined {
        if (!this._playerName) throw new Error('No player name specified');
        return this.my.vote;
    }

    async vote(vote: boolean | null): Promise<null | string> {
        if (!this._playerName) throw new Error('No player name specified');
        try {
            await Axios.post(`/api/${this._game._id}/votes/${this._playerName}`, { vote });
            mutate(`/api/${this._game._id}`);
        } catch (e) {
            return e.response.data;
        }
    }

    get allVotesIn(): boolean {
        let votes = 0;
        for (const voter of this.voters) {
            if (this.allowedVoters.has(voter)) votes++;
        }

        return this.allowedVoters.size > 0 && votes === this.allowedVoters.size;
    }

    get requiredTeamSize(): number {
        return GameSettings.get(this.players.length).quests[this.currentRoundNumber - 1].adventurers;
    }

    get readyToContinue(): boolean {
        if (this._game.votingStatus === null) {
            // team is being selected
            return (
                (this._playerName === this.leader || !this._playerName) && this.team.length === this.requiredTeamSize
            );
        }
        if (this._game.votingStatus === 'team' || this._game.votingStatus === 'mission') {
            // people are voting.
            return this.allVotesIn;
        }
        return true; // votes are being shown.
    }

    async continue(): Promise<null | string> {
        try {
            await Axios.post(`/api/${this._game._id}/continue`);
            mutate(`/api/${this._game._id}`);
        } catch (e) {
            return e.response.data;
        }
    }

    async endGame(): Promise<null | string> {
        try {
            await Axios.post(`/api/${this._game._id}/end`);
            mutate(`/api/${this._game._id}`);
            return null;
        } catch (e) {
            return e.response.data;
        }
    }

    async rerollGame(): Promise<null | string> {
        try {
            await Axios.post(`/api/${this._game._id}`, { force: true });
            mutate(`/api/${this._game._id}`);
            return null;
        } catch (e) {
            return e.response.data;
        }
    }

    async resetGame(): Promise<null | string> {
        try {
            await Axios.delete(`/api/${this._game._id}`);
            mutate(`/api/${this._game._id}`);
            return null;
        } catch (e) {
            return e.response.data;
        }
    }
}

export async function getOrCreateGame(gameName: string): Promise<GameStatus> {
    const db = await collections;
    const { value: game } = await db.games.findOneAndUpdate(
        { _id: gameName },
        {
            $setOnInsert: { players: [], status: 'prestart', history: [], votingStatus: null },
        },
        { upsert: true, returnOriginal: false },
    );

    return game;
}
