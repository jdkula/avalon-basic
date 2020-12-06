import { NextApiHandler } from 'next';
import { collections, getOrCreateGame } from '~/lib/db/mongo';
import Game from '~/lib/Game';

const Continue: NextApiHandler = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(400).end('POST only.');
    }

    const db = await collections;
    const gamename = req.query.gamename as string;

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
        if (game.votesShown === 'public') {
            // players are discussing the result of a mission proposal vote; moving onto the next.
            const succeeded = game.currentMission.approved.length > game.currentMission.rejected.length;
            if (succeeded) {
                game.root.votingStatus = 'mission';
            } else {
                // new "round"; mission moves to the next person.
                game.root.votingStatus = null;
                game.currentRound.missions.push({ approved: [], rejected: [], team: [] });
            }
        } else {
            // players are discussing the result of a mission gone by; moving to the next.
            // new round!
            game.root.votingStatus = null;
            game.root.history.push({
                failed: [],
                succeeded: [],
                missions: [{ approved: [], rejected: [], team: [] }],
            });
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

    await db.games.updateOne({ _id: gamename }, { $set: game.root });
    return res.status(200).send(game.root);
};

export default Continue;