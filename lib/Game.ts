import Axios from 'axios';
import { mutate } from 'swr';
import { GamePostStart, Mission, Player, Round } from './db/models';
import GameSettings from './GameSettings';
import Roles, { Role, RoleName } from './Roles';

type RoleKnowledge = { [role: string]: string[] };

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

    get myNotes(): string {
        return this.my.notes;
    }

    get myName(): string {
        return this._playerName;
    }

    get knowledge(): RoleKnowledge {
        const rn: RoleKnowledge = {};

        for (const player of this.root.players) {
            if (!this._playerName) {
                const list = rn[player.role] ?? [];
                list.push(player.name);
                rn[player.role] = list;
            } else {
                const knowledge = this.myRole.knows.find((k) => k.role === player.role);
                if (!knowledge) continue;
                const list = rn[knowledge.as] ?? [];
                list.push(player.name);
                rn[knowledge.as] = list;
            }
        }

        return rn;
    }

    get players(): string[] {
        return this._game.players.map((p) => p.name);
    }

    get roles(): Set<RoleName> {
        return new Set(this._game.players.map((p) => p.role));
    }

    get yesVotes(): string[] {
        return this._game.players.filter((p) => p.vote === true).map((p) => p.name);
    }

    get noVotes(): string[] {
        return this._game.players.filter((p) => p.vote === false).map((p) => p.name);
    }

    get voters(): string[] {
        return this._game.players.filter((p) => p.vote !== null).map((p) => p.name);
    }

    get nonVoters(): string[] {
        return this._game.players.filter((p) => p.vote === null).map((p) => p.name);
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

    get allowedVoters(): string[] {
        if (this._game.votingStatus === 'team' || this._game.votingStatus === 'public') {
            return this.players;
        }
        if (this._game.votingStatus === 'mission') {
            return this.team;
        }
        return [];
    }

    get canVote(): boolean {
        if (!this._playerName) throw new Error('No player name specified');
        return this.allowedVoters.includes(this._playerName);
    }

    get myVote(): boolean | null | undefined {
        if (!this._playerName) throw new Error('No player name specified');
        return this.my.vote;
    }

    async vote(vote: boolean | null): Promise<null | string> {
        if (!this._playerName) throw new Error('No player name specified');
        try {
            this.my.vote = vote;
            mutate(`/api/${this._game._id}`, this.root, false);
            await Axios.post(`/api/${this._game._id}/votes/${this._playerName}`, { vote });
            mutate(`/api/${this._game._id}`);
        } catch (e) {
            return e.response.data;
        }
    }

    get allVotesIn(): boolean {
        let votes = 0;
        for (const voter of this.voters) {
            if (this.allowedVoters.includes(voter)) votes++;
        }

        return this.allowedVoters.length > 0 && votes === this.allowedVoters.length;
    }

    get requiredTeamSize(): number {
        return GameSettings.get(this.players.length).quests[this.currentRoundNumber - 1].adventurers;
    }

    get isFinalMission(): boolean {
        return this.currentRound.missions.length === GameSettings.get(this.players.length).voteTrackLength;
    }

    get failsRequired(): number {
        return GameSettings.get(this.players.length).quests[this.currentRoundNumber - 1].failsRequired;
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

    async setTeam(team: string[]): Promise<null | string> {
        try {
            this.currentMission.team = team;
            mutate(`/api/${this._game._id}`, this.root, false);
            await Axios.put(`/api/${this._game._id}/team`, { team });
            mutate(`/api/${this._game._id}`);
            return null;
        } catch (e) {
            return e.response.data;
        }
    }

    async setNotes(notes: string): Promise<null | string> {
        if (!this._playerName) throw new Error('No player name specified');

        try {
            await Axios.post(`/api/${this._game._id}/players/${this._playerName}`, { notes });
            mutate(`/api/${this._game._id}`);
            return null;
        } catch (e) {
            return e.response.data;
        }
    }
}
