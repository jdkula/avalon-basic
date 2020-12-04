import { NextApiHandler } from 'next';
import { collections } from '~/lib/db/mongo';

const GameReset: NextApiHandler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(400).end('POST only.');
    }

    const db = await collections;

    const gamename = req.query.gamename as string;

    const game = await db.games.findOneAndUpdate(
        { _id: gamename },
        {
            $setOnInsert: { players: [], status: 'prestart', voting: null },
        },
        { upsert: true, returnOriginal: false },
    );
    if (game.value.status === 'prestart') {
        return res.status(412).end('Game was not started!');
    }

    res.send(
        await db.games.findOneAndUpdate(
            { _id: gamename },
            { $set: { status: 'prestart', players: [], voting: null } },
            { returnOriginal: false },
        ),
    );
};

export default GameReset;
