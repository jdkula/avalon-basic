import { Typography, Button, Box, Card, CardContent, TextField, Container } from '@material-ui/core';
import React, { FC, useState, ReactNode } from 'react';
import { GamePreStart } from '~/lib/db/models';
import GameSettings from '~/lib/GameSettings';
import Lobby from '~/lib/Lobby';
import useWithError from '~/lib/useWithError';
import FlexGridList from './FlexGridList';

interface LobbyViewProps {
    game: GamePreStart;
    gameName: string;
    playerName: string;
    setPlayerName: (name: string) => void;
}
const LobbyView: FC<LobbyViewProps> = ({ game, gameName, playerName, setPlayerName }) => {
    const [proposedName, setProposedName] = useState(playerName);

    const lobby = new Lobby(game);
    const withError = useWithError();

    let players = <FlexGridList elements={lobby.players} />;

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
                onClick={withError<never>(() => lobby.delete(playerName))}
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
                            onClick={withError<never>(() => lobby.start())}
                        >
                            Start Game
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default LobbyView;
