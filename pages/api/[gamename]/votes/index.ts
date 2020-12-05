import { NextApiHandler } from 'next';
import { collections, GamePostStart, getOrCreateGame } from '~/lib/db/mongo';

const ListVotes: NextApiHandler = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(400).end('GET only.');
    }

    const db = await collections;
    const gamename = req.query.gamename as string;

    const game = await getOrCreateGame(gamename);

    if (game.status === 'prestart') {
        return res.status(412).end('Game was not started!');
    }

    const votes = Object.fromEntries(game.players.map((p) => [p.name, p.vote]));

    res.send(votes);
};

export default ListVotes;
