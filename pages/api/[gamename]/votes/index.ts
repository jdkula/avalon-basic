import { NextApiHandler } from 'next';
import apiRoute from '~/lib/apiRoute';
import { getOrCreateGame } from '~/lib/db/util';

export default apiRoute(['gamename']).get(async (req, res) => {
    const { gamename } = req.params;
    const game = await getOrCreateGame(gamename);
    if (game.status === 'prestart') {
        return res.status(412).end('Game was not started!');
    }

    const votes = Object.fromEntries(game.players.map((p) => [p.name, p.vote]));

    res.send(votes);
});
