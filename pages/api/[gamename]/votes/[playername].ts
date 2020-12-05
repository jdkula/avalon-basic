import { NextApiHandler } from 'next';
import { collections, getOrCreateGame } from '~/lib/db/mongo';
import Game from '~/lib/Game';

const PlayerVote: NextApiHandler = async (req, res) => {
    const db = await collections;
    const { gamename, playername } = req.query as Record<string, string>;

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

    if (req.method === 'GET') {
        return res.send({ vote: game.myVote });
    } else if (req.method === 'DELETE') {
        if (!game.canVote) {
            return res.status(412).end("You're not allowed to vote!");
        }
        await db.games.updateOne(
            { _id: gamename },
            { $set: { 'players.$[player].vote': null } },
            { arrayFilters: [{ player: { name: playername } }] },
        );
        return res.send({ vote: null });
    } else if (req.method === 'POST') {
        if (!game.canVote) {
            return res.status(412).end("You're not allowed to vote!");
        }
        const { vote } = req.body;

        if (game.myRole.side === 'good' && vote === false) {
            return res.status(400).end('Good players are not allowed to vote down a mission (you traitor!)');
        }
        await db.games.updateOne(
            { _id: gamename },
            { $set: { 'players.$[player].vote': vote } },
            { arrayFilters: [{ 'player.name': playername }] },
        );
        return res.send({ vote });
    }
};

export default PlayerVote;
