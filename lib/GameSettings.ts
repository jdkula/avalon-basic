import game_config_raw from '~/config/games.json';

export type Quest = { adventurers: number; failsRequired: number };
export type GameSetting = { good: number; evil: number; quests: Quest[]; voteTrackLength: number };

export default class GameSettings {
    static readonly kMinPlayers = 5;
    static readonly kMaxPlayers = 10;

    static get(numPlayers: number): GameSetting {
        if (numPlayers < this.kMinPlayers || numPlayers > this.kMaxPlayers) {
            throw new Error(`Must have between ${this.kMinPlayers} and ${this.kMaxPlayers} players!`);
        }
        return game_config_raw[numPlayers.toString()];
    }
}
