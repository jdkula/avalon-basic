import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Paper,
    TextField,
    Typography,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { GetServerSideProps, NextPage } from 'next';
import { useSnackbar } from 'notistack';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import type { GamePostStart, GamePreStart, GameStatus } from '~/lib/db/mongo';
import GameSettings from '~/lib/GameSettings';
import Lobby from '~/lib/Lobby';
import Game from '~/lib/Game';

interface InitialProps {
    gameName: string;
    initialGame: GameStatus | null;
}

interface GameViewProps {
    game: GamePostStart;
    gameName: string;
    playerName: string;
}
const GameView: FC<GameViewProps> = ({ game: gameStub, gameName, playerName }) => {
    const { enqueueSnackbar } = useSnackbar();

    if (!playerName) return null;

    const game = new Game(gameStub, playerName);

    // TODO: Ew.
    const withError = (f: () => Promise<string | null> | string | null) => {
        const handler = async () => {
            const out = await f();
            if (typeof out === 'string') {
                enqueueSnackbar(out, { variant: 'error' });
            }
        };
        return handler;
    };

    return (
        <Container maxWidth="sm">
            <Box mt={4} />
            <Typography variant="h3" align="center" gutterBottom>
                <strong>{gameName}</strong>’s Avalon Game
            </Typography>
            <Accordion defaultExpanded>
                <AccordionSummary id="accordion1-game" aria-controls="accordion1-game" expandIcon={<ExpandMore />}>
                    <Typography variant="h5">Game Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box textAlign="center" width="100%">
                        <Typography>Players</Typography>
                        <Players players={game.players} />
                        <Box mt={2} />
                        <Typography>Roles</Typography>
                        <Players players={[...game.roles.keys()].sort()} />
                        <Box mt={4} />
                        <Accordion>
                            <AccordionSummary
                                id="accordion1.1-controls"
                                aria-controls="accordion1.1-controls"
                                expandIcon={<ExpandMore />}
                            >
                                Game Controls
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box display="flex" justifyContent="space-around" width="100%">
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={withError(() => game.endGame())}
                                    >
                                        End Game
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={withError(() => game.rerollGame())}
                                    >
                                        Reroll Game
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={withError(() => game.resetGame())}
                                    >
                                        Reset Game
                                    </Button>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                </AccordionDetails>
            </Accordion>
            <Accordion defaultExpanded>
                <AccordionSummary id="accordion2-role" aria-controls="accordion2-role" expandIcon={<ExpandMore />}>
                    <Typography variant="h5">Your Role</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box textAlign="center" width="100%">
                        <Typography>Your Role is: {game.myRole.name}</Typography>
                    </Box>
                </AccordionDetails>
            </Accordion>
            <Box pt={2} />
            <Card>
                <CardContent>TODO: The game happens here!</CardContent>
            </Card>
        </Container>
    );
};

const PlayerView = styled(Paper)<{ gray?: boolean }>`
    padding: ${({ theme }) => theme.spacing(1)}px;
    background-color: ${({ gray }) => (gray ? '#f0f0f0' : '#fff')};
`;

const Player: FC<{ name: string; even: boolean }> = ({ name, even }) => (
    <Grid item sm>
        <PlayerView gray={!even}>
            <Typography align="center">{name}</Typography>
        </PlayerView>
    </Grid>
);

const Players: FC<{ players: string[] }> = ({ players }) => (
    <Grid container spacing={2}>
        {players.map((p, i) => (
            <Player name={p} even={i % 2 === 0} key={p} />
        ))}
    </Grid>
);

interface LobbyViewProps {
    game: GamePreStart;
    gameName: string;
    playerName: string;
    setPlayerName: (name: string) => void;
}
const LobbyView: FC<LobbyViewProps> = ({ game, gameName, playerName, setPlayerName }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [proposedName, setProposedName] = useState(playerName);

    const lobby = new Lobby(game);
    // TODO: Ew.
    const withError = (f: () => Promise<string | null> | string | null) => {
        const handler = async () => {
            const out = await f();
            if (typeof out === 'string') {
                enqueueSnackbar(out, { variant: 'error' });
            }
        };
        return handler;
    };

    let players = <Players players={lobby.players} />;

    if (lobby.players.length === 0) {
        players = <Typography align="center">No players yet!</Typography>;
    }

    const canStart = lobby.players.length >= GameSettings.kMinPlayers;
    const acceptingJoins = lobby.players.length <= GameSettings.kMaxPlayers;
    const joined = lobby.players.includes(playerName);
    const isRejoin = lobby.players.includes(proposedName);

    const onJoin = withError(() => {
        setPlayerName(proposedName);
        return lobby.join(proposedName);
    });

    let button: ReactNode;
    if (joined) {
        button = (
            <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={withError(() => lobby.delete(playerName))}
            >
                Leave
            </Button>
        );
    } else if (isRejoin) {
        button = (
            <Button variant="outlined" color="primary" size="large" onClick={onJoin}>
                Re-Join
            </Button>
        );
    } else {
        button = (
            <Button variant="contained" color="primary" size="large" onClick={onJoin} disabled={!acceptingJoins}>
                Join
            </Button>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box pt={4} />
            <Typography variant="h3" align="center" gutterBottom>
                <strong>{gameName}</strong>’s Lobby
            </Typography>
            <Card>
                <CardContent>
                    <Typography variant="h4" align="center" gutterBottom>
                        Current Players:
                    </Typography>
                    {players}
                </CardContent>
            </Card>
            <Box pt={2} />
            <Card>
                <CardContent>
                    <Box
                        textAlign="center"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <TextField
                            variant="outlined"
                            label="Your Name"
                            value={proposedName}
                            onChange={(e) => setProposedName(e.target.value)}
                            disabled={joined || !acceptingJoins}
                        />
                        <Box mt={2} display="flex" alignItems="center">
                            {button}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            <Box pt={2} />
            <Card>
                <CardContent>
                    <Box textAlign="center" display="flex" justifyContent="center" alignItems="center">
                        <Button
                            size="large"
                            variant="contained"
                            color="primary"
                            disabled={!canStart}
                            onClick={withError(() => lobby.start())}
                        >
                            Start Game
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

const TheGame: NextPage<InitialProps> = ({ gameName, initialGame }) => {
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
        window.localStorage.setItem(`__AVALON_${gameName}_name`, name);
    }, [name]);

    if (!game) {
        return <CircularProgress />;
    }

    if (game?.status === 'prestart') {
        return <LobbyView game={game} gameName={gameName} playerName={name} setPlayerName={setName} />;
    } else {
        return <GameView game={game} gameName={gameName} playerName={name} />;
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
