import { NextApiHandler } from 'next';
import { collections } from '~/lib/db/mongo';
import { assignRoles, MIN_PLAYERS, RoleName } from '~/lib/roles';

const GameStart: NextApiHandler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(400).end('POST only.');
    }

    const optionalRoles: RoleName[] = req.body.optionalRoles;

    const db = await collections;

    const gamename = req.query.gamename as string;

    const game = await db.games.findOneAndUpdate(
        { _id: gamename },
        {
            $setOnInsert: { players: [], status: 'prestart', voting: null },
        },
        { upsert: true, returnOriginal: false },
    );
    if (game.value.players.length < MIN_PLAYERS) {
        return res.status(412).end('Game does not have enough players!');
    }
    if (game.value.status === 'poststart') {
        return res.status(412).end('Game is already started!');
    }

    const startedGame = assignRoles(game.value, ['Loyal', 'Minion', 'Merlin', ...optionalRoles]);
    delete startedGame._id;

    res.send(await db.games.findOneAndUpdate({ _id: gamename }, { $set: startedGame }, { returnOriginal: false }));
};

export default GameStart;
