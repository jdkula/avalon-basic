import role_config from '~/config/roles.json';
import type { GamePostStart, GamePreStart, GameStatus } from './db/mongo';
import GameSettings from './GameSettings';

export type RoleName = keyof typeof role_config;
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

export default class Roles {
    static readonly kRequiredRoles: RoleName[] = (Object.keys(role_config) as RoleName[]).filter(
        (x) => role_config[x].required,
    );
    static readonly kAllRoles: RoleName[] = Object.keys(role_config) as RoleName[];

    static get(role: RoleName): Role {
        const out = role_config[role] as Role;
        if (!out) throw new Error(`Invalid role ${role} entered!`);

        return out;
    }

    static assign(pregame: GameStatus, enabledRoles: RoleName[]): GamePostStart {
        const game: GamePostStart = {
            _id: pregame._id,
            status: 'poststart',
            players: [],
            history: [{ failed: [], succeeded: [], missions: [{ approved: [], rejected: [], team: [] }] }],
            votingStatus: null,
        };

        const players = shuffle((pregame as GamePreStart).players.map((p) => p.name));
        const selectedRoles: Role[] = (Object.keys(role_config) as RoleName[])
            .filter((role) => enabledRoles.includes(role))
            .map((role) => JSON.parse(JSON.stringify(role_config[role])))
            .sort((a, b) => (a.max ?? Number.POSITIVE_INFINITY) - (b.max ?? Number.POSITIVE_INFINITY));

        const setup = GameSettings.get(players.length);

        const goodRoles = selectedRoles.filter((r) => r.side === 'good');
        const evilRoles = selectedRoles.filter((r) => r.side === 'evil');

        for (let i = 0; i < setup.good; i++) {
            const name = players.pop();
            const role = getNextRole(goodRoles);
            game.players.push({
                name,
                role: role.name,
                vote: null,
                notes: '',
            });
        }

        for (let i = 0; i < setup.evil; i++) {
            const name = players.pop();
            const role = getNextRole(evilRoles);
            game.players.push({
                name,
                role: role.name,
                vote: null,
                notes: '',
            });
        }

        game.players = shuffle(game.players);
        return game;
    }
}
