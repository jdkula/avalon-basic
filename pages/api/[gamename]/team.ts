import { NextApiHandler } from 'next';
import { collections, getOrCreateGame } from '~/lib/db/mongo';
import Game from '~/lib/Game';

const Team: NextApiHandler = async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'PUT') {
        return res.status(400).end('GET or PUT only');
    }
    const db = await collections;

    const gamename = req.query.gamename as string;

    const gameStub = await getOrCreateGame(gamename);
    if (gameStub.status === 'prestart') {
        return res.status(412).end('Game has not yet started!');
    }

    const game = new Game(gameStub);

    if (req.method === 'PUT') {
        if (game.root.votingStatus !== null) {
            return res.status(412).end("You can't change the team during or after voting!");
        }
        game.currentMission.team = [...new Set<string>(req.body.team)];
        await db.games.updateOne({ _id: gamename }, { $set: game.root });
    }

    return res.send(game.team);
};

export default Team;