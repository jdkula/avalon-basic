import database from './collections';
import { GameStatus } from './models';

export async function getOrCreateGame(gameName: string): Promise<GameStatus> {
    const db = await database();
    const { value: game } = await db.games.findOneAndUpdate(
        { _id: gameName },
        {
            $setOnInsert: { players: [], status: 'prestart', history: [], votingStatus: null },
        },
        { upsert: true, returnOriginal: false },
    );

    return game;
}
