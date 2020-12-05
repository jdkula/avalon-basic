import { NextApiHandler } from 'next';
import { collections } from '~/lib/db/mongo';
import Game, { getOrCreateGame } from '~/lib/game';

const Team: NextApiHandler = async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(400).end('GET or POST only');
    }
    const db = await collections;

    const gamename = req.query.gamename as string;

    const gameStub = await getOrCreateGame(gamename);
    if (gameStub.status === 'prestart') {
        return res.status(412).end('Game has not yet started!');
    }

    const game = new Game(gameStub);

    if (req.method === 'POST') {
        if (game.root.votingStatus !== null) {
            return res.status(412).end("You can't change the team during or after voting!");
        }
        game.currentMission.team = req.body.team;
        await db.games.updateOne({ _id: gamename }, { $set: game.root });
    }

    return res.send(game.team);
};

export default Team;
