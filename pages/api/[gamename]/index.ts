import { NextApiHandler } from 'next';
import { collections } from '~/lib/db/mongo';

const GameControl: NextApiHandler = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(400).end('GET only.');
    }

    const db = await collections;

    const gamename = req.query.gamename as string;

    res.send(
        await db.games.findOneAndUpdate(
            { _id: gamename },
            {
                $setOnInsert: { players: [], status: 'prestart', voting: null },
            },
            { upsert: true, returnOriginal: false },
        ),
    );
};

export default GameControl;
