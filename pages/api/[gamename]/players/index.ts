import apiRoute from '~/lib/apiRoute';
import { getOrCreateGame } from '~/lib/db/util';

export default apiRoute(['gamename']).get(async (req, res) => {
    const game = await getOrCreateGame(req.params.gamename);
    return res.send(game.players);
});
