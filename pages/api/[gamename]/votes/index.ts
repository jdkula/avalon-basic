import { NextApiHandler } from 'next';
import { collections, GamePostStart } from '~/lib/db/mongo';

const ShowVotes: NextApiHandler = async (req, res) => {
    if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'DELETE') {
        return res.status(400).end('GET, PUT, DELETE only.');
    }

    const db = await collections;
    const gamename = req.query.gamename as string;

    const mode: 'public' | 'private' | undefined = req.body.mode;

    const game = await db.games.findOneAndUpdate(
        { _id: gamename },
        {
            $setOnInsert: { players: [], status: 'prestart', voting: null },
        },
        { upsert: true, returnOriginal: false },
    );
    if (game.value.status === 'prestart') {
        return res.status(412).end('Game was not started!');
    }

    if (req.method === 'DELETE') {
        return res.send(
            (
                await db.games.findOneAndUpdate(
                    { _id: gamename },
                    { $set: { 'players.$[].vote': null, voting: null } },
                    { returnOriginal: false },
                )
            ).value,
        );
    }

    const numVotes = game.value.players.filter((p) => p.vote !== null).length;
    if (numVotes !== game.value.players.length) {
        return res.status(412).end('Still waiting on votes!');
    }

    let newGame: GamePostStart;
    if (req.method === 'PUT') {
        if (mode !== 'public' && mode !== 'private') {
            return res.status(400).end('Must specify mode as public or private');
        }
        newGame = (
            await db.games.findOneAndUpdate({ _id: gamename }, { $set: { voting: mode } }, { returnOriginal: false })
        ).value as GamePostStart;
    } else {
        if (game.value.voting === null) {
            return res.status(412).end('Votes have not yet been shown!');
        }
        newGame = game.value;
    }

    const votes = Object.fromEntries(newGame.players.map((p) => [p.name, p.vote]));

    res.send(votes);
};

export default ShowVotes;
