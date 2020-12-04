import { NextApiHandler } from 'next';
import { collections } from '~/lib/db/mongo';
import { RoleName, MIN_PLAYERS, assignRoles } from '~/lib/roles';

const GameControl: NextApiHandler = async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'DELETE' && req.method !== 'POST') {
        return res.status(400).end('GET, DELETE, POST only.');
    }

    const db = await collections;

    const gamename = req.query.gamename as string;

    const { value: game } = await db.games.findOneAndUpdate(
        { _id: gamename },
        {
            $setOnInsert: { players: [], status: 'prestart', voting: null },
        },
        { upsert: true, returnOriginal: false },
    );

    if (req.method === 'GET') {
        return res.send(game);
    } else if (req.method === 'DELETE') {
        if (game.status === 'prestart') {
            return res.status(412).end('Game was not started!');
        }

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
        if (game.players.length < MIN_PLAYERS) {
            return res.status(412).end('Game does not have enough players!');
        }
        if (game.status === 'poststart' && !force) {
            return res.status(412).end('Game is already started!');
        }

        const startedGame = assignRoles(game, ['Loyal', 'Minion', 'Merlin', 'Assassin', ...optionalRoles]);
        delete startedGame._id;

        res.send(
            (await db.games.findOneAndUpdate({ _id: gamename }, { $set: startedGame }, { returnOriginal: false }))
                .value,
        );
    }
};

export default GameControl;
