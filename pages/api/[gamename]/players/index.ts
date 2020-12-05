import { NextApiHandler } from 'next';
import { collections, getOrCreateGame } from '~/lib/db/mongo';

const PlayerList: NextApiHandler = async (req, res) => {
    const db = await collections;

    const { gamename } = req.query as Record<string, string>;

    const game = await getOrCreateGame(gamename);

    if (req.method === 'GET') {
        return res.send(game.players);
    } else {
        return res.status(400).end('GET Only.');
    }
};

export default PlayerList;
