import { NextApiHandler } from 'next';
import { collections } from '~/lib/db/mongo';
import { getOrCreateGame } from '~/lib/game';

const PlayerList: NextApiHandler = async (req, res) => {
    const db = await collections;

    const { gamename } = req.query as Record<string, string>;

    const { value: game } = await getOrCreateGame(gamename);

    if (req.method === 'GET') {
        return res.send(game.players);
    }
};

export default PlayerList;
