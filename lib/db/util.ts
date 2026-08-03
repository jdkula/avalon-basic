import database from './collections';
import { GameStatus } from './models';

export async function getOrCreateGame(gameName: string): Promise<GameStatus> {
    gameName = gameName.toLowerCase();

    const db = await database();
    const res = await db.games.findOneAndUpdate(
        { _id: gameName },
        {
            $setOnInsert: { players: [], status: 'prestart', history: [], votingStatus: null },
        },
        { upsert: true, returnDocument: 'before' },
    );

    return res;
}
