import apiRoute from '~/lib/apiRoute';

export default apiRoute(['gamename']).post(async (req, res) => {
    const { value: game } = await req.db.games.findOneAndUpdate(
        { _id: req.params.gamename },
        {
            $setOnInsert: { players: [] },
            $set: { status: 'prestart', history: [], votingStatus: null },
        },
        { upsert: true, returnOriginal: false },
    );

    return res.send(game);
});
