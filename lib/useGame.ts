import React, { useContext } from 'react';
import Game from './Game';

export const GameContext = React.createContext<Game>(null as never);

export default function useGame(): Game {
    return useContext(GameContext);
}
