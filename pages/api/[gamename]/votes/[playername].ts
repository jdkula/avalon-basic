import { NextApiHandler } from 'next';
import { collections } from '~/lib/db/mongo';

const PlayerVote: NextApiHandler = async (req, res) => {
    const db = await collections;
    const { gamename, playername } = req.query as Record<string, string>;

    const { value: game } = await db.games.findOneAndUpdate(
        { _id: gamename },
        {
            $setOnInsert: { players: [], status: 'prestart', voting: null },
        },
        { upsert: true, returnOriginal: false },
    );

    if (game.status === 'prestart') {
        return res.status(412).send('Game has not started yet!');
    }
    if (game.voting !== null) {
        return res.status(412).send('Votes are currently being shown!');
    }

    const player = game.players.find((p) => p.name === playername) ?? null;
    if (!player) {
        return res.status(404).end('Player not found');
    }

    if (req.method === 'GET') {
        return res.send({ vote: player.vote });
    } else if (req.method === 'DELETE') {
        await db.games.updateOne(
            { _id: gamename },
            { $set: { 'players.$[player].vote': null } },
            { arrayFilters: [{ player: { name: playername } }] },
        );
        return res.send({ vote: null });
    } else if (req.method === 'POST') {
        const { vote } = req.body;
        await db.games.updateOne(
            { _id: gamename },
            { $set: { 'players.$[player].vote': vote } },
            { arrayFilters: [{ 'player.name': playername }] },
        );
        return res.send({ vote });
    }
};

export default PlayerVote;
