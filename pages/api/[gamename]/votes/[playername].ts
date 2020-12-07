import apiRoute from '~/lib/apiRoute';
import { getOrCreateGame } from '~/lib/db/util';
import Game from '~/lib/Game';

export default apiRoute(['gamename', 'playername'])
    .all(async (req, res, next) => {
        const { gamename, playername } = req.params;
        const gameStub = await getOrCreateGame(gamename);

        if (gameStub.status === 'prestart') {
            return res.status(412).send('Game has not started yet!');
        }
        const game = new Game(gameStub, playername);

        if (!game.voting) {
            return res.status(412).send('A vote has not yet been called!');
        }

        if (!game.players.includes(playername)) {
            return res.status(404).end('Player not found');
        }

        // Probably hacky but this is fine™
        req.body._game = game;

        next();
    })
    .get((req, res) => {
        const game = req.body._game;
        return res.send({ vote: game.myVote });
    })
    .post(async (req, res) => {
        const { gamename, playername } = req.params;
        const game = req.body._game;

        if (!game.canVote) {
            return res.status(412).end("You're not allowed to vote!");
        }
        const { vote } = req.body;

        if (game.voting === 'mission' && game.myRole.side === 'good' && vote === false) {
            return res.status(400).end('Good players are not allowed to vote down a mission (you traitor!)');
        }
        await req.db.games.updateOne(
            { _id: gamename },
            { $set: { 'players.$[player].vote': vote } },
            { arrayFilters: [{ 'player.name': playername }] },
        );
        return res.send({ vote });
    })
    .delete(async (req, res) => {
        const { gamename, playername } = req.params;
        const game = req.body._game;

        if (!game.canVote) {
            return res.status(412).end("You're not allowed to vote!");
        }
        await req.db.games.updateOne(
            { _id: gamename },
            { $set: { 'players.$[player].vote': null } },
            { arrayFilters: [{ player: { name: playername } }] },
        );
        return res.send({ vote: null });
    });
