import { NextApiHandler } from 'next';
import { collections, getOrCreateGame, Player } from '~/lib/db/mongo';
import GameSettings from '~/lib/GameSettings';
import Roles, { RoleName } from '~/lib/Roles';

const GameControl: NextApiHandler = async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'DELETE' && req.method !== 'POST') {
        return res.status(400).end('GET, DELETE, POST only.');
    }

    const db = await collections;

    const gamename = req.query.gamename as string;

    const game = await getOrCreateGame(gamename);

    if (req.method === 'GET') {
        return res.send(game);
    } else if (req.method === 'DELETE') {
        return res.send(
            (
                await db.games.findOneAndUpdate(
                    { _id: gamename },
                    { $set: { status: 'prestart', players: [], voting: null } },
                    { returnOriginal: false },
                )
            ).value,
        );
    } else if (req.method === 'POST') {
        const optionalRoles: RoleName[] = req.body.optionalRoles ?? [];
        const force = req.body.force;
        if (game.players.length < GameSettings.kMinPlayers) {
            return res.status(412).end('Game does not have enough players!');
        }
        if (game.status === 'poststart' && !force) {
            return res.status(412).end('Game is already started!');
        }

        const startedGame = Roles.assign(game, ['Loyal', 'Minion', 'Merlin', 'Assassin', ...optionalRoles]);
        delete startedGame._id;

        res.send(
            (await db.games.findOneAndUpdate({ _id: gamename }, { $set: startedGame }, { returnOriginal: false }))
                .value,
        );
    }
};

export default GameControl;
