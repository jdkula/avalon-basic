import role_config_raw from '~/lib/role_config.json';
import players_config_raw from '~/lib/players_config.json';
import { GamePostStart, GamePreStart } from './db/mongo';

export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 10;
type PlayerConfig = { good: number; evil: number };
type Players = { [num in '5' | '6' | '7' | '8' | '9' | '10']: PlayerConfig };
export const players_config = players_config_raw as Players;

export type RoleName = keyof typeof role_config_raw;
export type Side = 'good' | 'evil';

export interface Knowledge {
    role: RoleName;
    as: string;
}

export interface Role {
    name: RoleName;
    knows: Knowledge[];
    side: Side;
    max: number | null;
    required: boolean;
}

export type Roles = { [role in RoleName]: Role };

const roles_config = role_config_raw as Roles;

export default roles_config;

function randomInt(minInclusive: number, maxExclusive: number): number {
    const range = maxExclusive - minInclusive;
    return Math.floor(Math.random() * range) + minInclusive;
}

function shuffle<T>(arr: T[]): T[] {
    if (arr.length === 0) return [];
    const randIndex = randomInt(0, arr.length);
    const [el] = arr.splice(randIndex, 1);
    return [el, ...shuffle(arr)];
}

function getNextRole(roles: Role[]): Role {
    while (roles.length > 0) {
        if (roles[0].max === 0) {
            roles.splice(0, 1);
        } else {
            if (roles[0].max !== null) {
                roles[0].max--;
            }
            return roles[0];
        }
    }
    throw new Error('Ran out of roles!!');
}

export function assignRoles(pregame: GamePreStart, enabledRoles: RoleName[]): GamePostStart {
    const game: GamePostStart = {
        _id: pregame._id,
        status: 'poststart',
        voting: null,
        players: [],
    };

    const players = shuffle(pregame.players.map((p) => p.name));
    const selectedRoles: Role[] = (Object.keys(roles_config) as RoleName[])
        .filter((role) => enabledRoles.includes(role))
        .map((role) => JSON.parse(JSON.stringify(roles_config[role])))
        .sort((a, b) => (a.max ?? Number.POSITIVE_INFINITY) - (b.max ?? Number.POSITIVE_INFINITY));

    const playerSetup: PlayerConfig | undefined = players_config[players.length];
    if (!playerSetup) {
        throw new Error('Invalid number of players!');
    }
    const goodRoles = selectedRoles.filter((r) => r.side === 'good');
    const evilRoles = selectedRoles.filter((r) => r.side === 'evil');

    for (let i = 0; i < playerSetup.good; i++) {
        const name = players.pop();
        const role = getNextRole(goodRoles);
        game.players.push({
            name,
            role: role.name,
            vote: null,
        });
    }

    for (let i = 0; i < playerSetup.evil; i++) {
        const name = players.pop();
        const role = getNextRole(evilRoles);
        game.players.push({
            name,
            role: role.name,
            vote: null,
        });
    }

    return game;
}
