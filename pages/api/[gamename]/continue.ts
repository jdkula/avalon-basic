import apiRoute from '~/lib/apiRoute';
import { getOrCreateGame } from '~/lib/db/util';
import Game from '~/lib/Game';
import GameSettings from '~/lib/GameSettings';

export default apiRoute(['gamename'])
    .use((req, res, next) => {
        req.params.gamename = req.params.gamename.toLowerCase();
        next();
    })
    .post(async (req, res) => {
        const { gamename } = req.params;
        const gameStub = await getOrCreateGame(gamename);
        if (gameStub.status === 'prestart') {
            return res.status(412).end('Game was not started!');
        }

        const game = new Game(gameStub);
        if (game.voting) {
            // Team has been proposed or accepted
            if (!game.allVotesIn) {
                return res.status(412).end('Not everyone who needs to has voted yet!');
            }
            if (game.voting === 'team') {
                game.currentMission.approved = game.yesVotes;
                game.currentMission.rejected = game.noVotes;
                game.root.votingStatus = 'public'; // votes are now shown.
            } else {
                game.currentRound.succeeded = game.yesVotes;
                game.currentRound.failed = game.noVotes;
                game.root.votingStatus = 'private'; // votes are now shown, but not who voted for what.
            }
        } else if (game.votesShown) {
            // players are currently discussing vote results.
            const noConsensus =
                game.isFinalMission && game.currentMission.approved.length <= game.currentMission.rejected.length;
            if (game.votesShown === 'private' || noConsensus) {
                // players are discussing the result of a mission gone by; moving to the next.
                // (Or the players rejected the fifth mission in a row, which gives the mission to Evil.)
                if (game.currentRoundNumber >= GameSettings.get(game.players.length).quests.length) {
                    return res.status(412).send('No more quests! That’s the end of the game!');
                }

                // new round!
                game.root.votingStatus = null;
                game.root.history.push({
                    failed: [],
                    succeeded: [],
                    missions: [{ approved: [], rejected: [], team: [] }],
                });
            } else {
                // players are discussing the result of a mission proposal vote; moving onto the next.
                const succeeded = game.currentMission.approved.length > game.currentMission.rejected.length;
                if (succeeded) {
                    game.root.votingStatus = 'mission';
                } else {
                    // new "round"; mission moves to the next person.
                    game.root.votingStatus = null;
                    game.currentRound.missions.push({ approved: [], rejected: [], team: [] });
                }
            }
            // Clear all votes
            game.root.players = game.root.players.map((p) => ({ ...p, vote: null }));
        } else {
            // leader is currently deciding who will be on the mission.
            if (game.team.length > game.requiredTeamSize) {
                return res.status(412).end('Too many players have been selected for the mission!');
            }
            if (game.team.length < game.requiredTeamSize) {
                return res.status(412).end('Too few players have been selected for the mission!');
            }

            game.root.votingStatus = 'team';
        }

        await req.db.games.updateOne({ _id: gamename }, { $set: game.root });
        return res.status(200).send(game.root);
    });
