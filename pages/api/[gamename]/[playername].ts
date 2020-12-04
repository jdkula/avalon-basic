import { NextApiHandler } from 'next';
import { collections, Player } from '~/lib/db/mongo';
import { MAX_PLAYERS } from '~/lib/roles';

const PlayerControl: NextApiHandler = async (req, res) => {
    const db = await collections;

    const { gamename, playername } = req.query as Record<string, string>;

    const { value: game } = await db.games.findOneAndUpdate(
        { _id: gamename },
        {
            $setOnInsert: { players: [], status: 'prestart', voting: null },
        },
        { upsert: true, returnOriginal: false },
    );

    if (req.method === 'GET') {
        const player = game.players.find((p) => p.name === playername) ?? null;
        if (!player) {
            return res.status(404).end('Player not found.');
        }
        return res.send(player);
    } else if (req.method === 'DELETE') {
        if (game.status === 'poststart') {
            return res.status(412).end('Cannot remove player from game in progress');
        }
        if (!game.players.find((p) => p.name === playername)) {
            return res.status(404).end('Player not found.');
        }
        await db.games.updateOne({ _id: gamename }, { $pull: { players: { name: playername } } });
        return res.status(200).end('Player removed.');
    } else if (req.method === 'POST') {
        if (game.status === 'poststart') {
            return res.status(412).end('Cannot remove player from game in progress');
        }
        const existientPlayer = game.players.find((p) => p.name === playername);
        if (existientPlayer) {
            return res.status(200).send(existientPlayer);
        }
        if (game.players.length >= MAX_PLAYERS) {
            return res.status(412).end('Game is at the maximum number of players!');
        }
        const player: Player = { name: playername, role: null, vote: null };
        await db.games.updateOne({ _id: gamename }, { $push: { players: player } });
        return res.status(201).send(player);
    }
};

export default PlayerControl;
