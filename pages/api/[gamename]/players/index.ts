import apiRoute from '~/lib/apiRoute';
import { getOrCreateGame } from '~/lib/db/util';

export default apiRoute(['gamename'])
    .use((req, res, next) => {
        req.params.gamename = req.params.gamename.toLowerCase();
        next();
    })
    .get(async (req, res) => {
        const game = await getOrCreateGame(req.params.gamename);
        return res.send(game.players);
    });
