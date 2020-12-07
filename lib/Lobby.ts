import Axios from 'axios';
import { mutate } from 'swr';
import { GamePreStart, GameStatus } from './db/models';

export default class Lobby {
    constructor(private readonly _game: GameStatus) {}

    get players(): string[] {
        return (this._game as GamePreStart).players.map((p) => p.name);
    }

    async join(playerName: string): Promise<string | null> {
        try {
            await Axios.post(`/api/${this._game._id}/players/${playerName}`);
            mutate(`/api/${this._game._id}`);
            mutate(`/api/${this._game._id}/players`);
            mutate(`/api/${this._game._id}/${playerName}`);
            return null;
        } catch (e) {
            return e.response.data;
        }
    }

    async delete(playerName: string): Promise<string | null> {
        try {
            await Axios.delete(`/api/${this._game._id}/players/${playerName}`);
            mutate(`/api/${this._game._id}`);
            mutate(`/api/${this._game._id}/players`);
            mutate(`/api/${this._game._id}/players/${playerName}`);
            return null;
        } catch (e) {
            return e.response.data;
        }
    }

    async start(): Promise<string | null> {
        try {
            await Axios.post(`/api/${this._game._id}`);
            mutate(`/api/${this._game._id}`);
            return null;
        } catch (e) {
            return e.response.data;
        }
    }
}
