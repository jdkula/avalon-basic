import { NextApiHandler } from 'next';
import apiRoute from '~/lib/apiRoute';
import { getOrCreateGame } from '~/lib/db/util';
import Game from '~/lib/Game';

export default apiRoute(['gamename'])
    .all(async (req, res, next) => {
        const gameStub = await getOrCreateGame(req.params.gamename);
        if (gameStub.status === 'prestart') {
            return res.status(412).end('Game has not yet started!');
        }

        const game = new Game(gameStub);
        req.body._game = game; // Another hack™
        next();
    })
    .get((req, res) => {
        res.send(req.body._game.team);
    })
    .put(async (req, res) => {
        const game: Game = req.body._game;
        if (game.root.votingStatus !== null) {
            return res.status(412).end("You can't change the team during or after voting!");
        }
        const newTeam = [...new Set<string>(req.body.team.filter((v) => typeof v === 'string'))];
        if (newTeam.length > game.requiredTeamSize) {
            return res.status(400).end('That team is too large!');
        }
        game.currentMission.team = newTeam;
        await req.db.games.updateOne({ _id: req.params.gamename }, { $set: game.root });
        res.send(game.team);
    });
