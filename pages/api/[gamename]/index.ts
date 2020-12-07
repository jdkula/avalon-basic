import apiRoute from '~/lib/apiRoute';
import { getOrCreateGame } from '~/lib/db/util';
import GameSettings from '~/lib/GameSettings';
import Roles, { RoleName } from '~/lib/Roles';

export default apiRoute(['gamename'])
    .get(async (req, res) => {
        return res.send(await getOrCreateGame(req.params.gamename));
    })
    .delete(async (req, res) => {
        return res.send(
            (
                await req.db.games.findOneAndUpdate(
                    { _id: req.params.gamename },
                    { $set: { status: 'prestart', players: [], history: [], votingStatus: null } },
                    { returnOriginal: false },
                )
            ).value,
        );
    })
    .post(async (req, res) => {
        const game = await getOrCreateGame(req.params.gamename);

        const optionalRoles: RoleName[] = req.body.optionalRoles ?? [];
        const force = req.body.force;
        if (game.players.length < GameSettings.kMinPlayers) {
            return res.status(412).end('Game does not have enough players!');
        }
        if (game.status === 'poststart' && !force) {
            return res.status(412).end('Game is already started!');
        }

        const startedGame = Roles.assign(game, ['Loyal', 'Minion', 'Merlin', 'Assassin', ...optionalRoles]);
        delete startedGame._id;

        res.send(
            (await req.db.games.findOneAndUpdate({ _id: game._id }, { $set: startedGame }, { returnOriginal: false }))
                .value,
        );
    });
