import { CircularProgress } from '@material-ui/core';
import { GetServerSideProps, NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import GameView from '~/components/GameView';
import LobbyView from '~/components/LobbyView';
import { GameStatus, GamePreStart } from '~/lib/db/models';
import Game from '~/lib/Game';
import { GameContext } from '~/lib/useGame';

interface InitialProps {
    gameName: string;
    initialGame: GameStatus | null;
}

const TheGame: NextPage<InitialProps> = ({ gameName, initialGame }) => {
    gameName = gameName.toLowerCase();
    const { data: game } = useSWR<GameStatus | null>(`/api/${gameName}`, {
        initialData: initialGame,
        refreshInterval: 1000,
    });

    const [name, setName] = useState('');

    useEffect(() => {
        const name = window.localStorage.getItem(`__AVALON_${gameName}_name`);
        if (name) setName(name);
    }, []);
    useEffect(() => {
        if (name) {
            window.localStorage.setItem(`__AVALON_${gameName}_name`, name);
        }
    }, [name]);

    if (!game) {
        return <CircularProgress />;
    }

    if (game?.status === 'prestart' || !name || !game.players.map((p) => p.name).includes(name)) {
        return <LobbyView game={game as GamePreStart} gameName={gameName} playerName={name} setPlayerName={setName} />;
    } else {
        return (
            <GameContext.Provider value={new Game(game, name)}>
                <GameView />
            </GameContext.Provider>
        );
    }
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
        props: {
            gameName: context.query.gamename as string,
        },
    };
};

export default TheGame;
