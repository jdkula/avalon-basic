import { NextApiHandler } from 'next';
import { collections } from '~/lib/db/mongo';

const EndGame: NextApiHandler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(400).end('POST only.');
    }

    const db = await collections;
    const gamename = req.query.gamename as string;

    const { value: game } = await db.games.findOneAndUpdate(
        { _id: gamename },
        {
            $setOnInsert: { players: [] },
            $set: { status: 'prestart', history: [], votingStatus: null },
        },
        { upsert: true, returnOriginal: false },
    );

    return res.send(game);
};

export default EndGame;
