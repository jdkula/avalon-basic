import { NextApiHandler } from 'next';
import apiRoute from '~/lib/apiRoute';
import { Player } from '~/lib/db/models';
import { getOrCreateGame } from '~/lib/db/util';
import GameSettings from '~/lib/GameSettings';
import Roles from '~/lib/Roles';

export default apiRoute(['gamename', 'playername'])
    .get(async (req, res) => {
        const { gamename, playername } = req.params;

        const game = await getOrCreateGame(gamename);

        const player = game.players.find((p) => p.name === gamename) ?? null;
        if (!player) {
            return res.status(404).end('Player not found.');
        }
        return res.send(player);
    })
    .delete(async (req, res) => {
        const { gamename, playername } = req.params;
        const game = await getOrCreateGame(gamename);

        if (game.status === 'poststart') {
            return res.status(412).end('Cannot remove player from game in progress');
        }
        if (!game.players.find((p) => p.name === playername)) {
            return res.status(404).end('Player not found.');
        }
        await req.db.games.updateOne({ _id: gamename }, { $pull: { players: { name: playername } } });
        return res.status(200).end('Player removed.');
    })
    .post(async (req, res) => {
        const { gamename, playername } = req.params;
        const game = await getOrCreateGame(gamename);

        const existientPlayer = game.players.find((p) => p.name === playername);
        const notes = (req.body.notes as string) || '';

        if (existientPlayer) {
            if (notes !== existientPlayer.notes) {
                await req.db.games.updateOne(
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
        await req.db.games.updateOne({ _id: gamename }, { $push: { players: player } });
        return res.status(201).send(player);
    });
