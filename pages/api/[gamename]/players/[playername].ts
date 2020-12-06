import { NextApiHandler } from 'next';
import { collections, getOrCreateGame, Player } from '~/lib/db/mongo';
import GameSettings from '~/lib/GameSettings';
import Roles from '~/lib/Roles';

const PlayerControl: NextApiHandler = async (req, res) => {
    const db = await collections;

    const { gamename, playername } = req.query as Record<string, string>;

    const game = await getOrCreateGame(gamename);

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
        const existientPlayer = game.players.find((p) => p.name === playername);
        const notes = (req.body.notes as string) || '';

        if (existientPlayer) {
            if (notes !== existientPlayer.notes) {
                await db.games.updateOne(
                    { _id: gamename, 'players.name': playername },
                    {
                        $set: {
                            'players.$[].notes': notes,
                        },
                    },
                );
            }
            return res.status(200).send({ ...existientPlayer, notes });
        }
        if (game.players.length >= GameSettings.kMaxPlayers) {
            return res.status(412).end('Game is at the maximum number of players!');
        }
        if (game.status === 'poststart') {
            return res.status(412).end('Cannot add a player to a game in progress');
        }
        const player: Player = { name: playername, role: null, vote: null, notes };
        await db.games.updateOne({ _id: gamename }, { $push: { players: player } });
        return res.status(201).send(player);
    }
};

export default PlayerControl;
