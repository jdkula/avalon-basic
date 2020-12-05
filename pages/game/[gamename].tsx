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
    List,
    ListItem,
    TextField,
    Typography,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import Axios from 'axios';
import { GetServerSideProps, NextPage } from 'next';
import { useSnackbar } from 'notistack';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import useSWR from 'swr';
import type { GamePostStart, GamePreStart, GameStatus } from '~/lib/db/mongo';
import roles_config, { PlayerConfig, players_config, Role } from '~/lib/Roles';

interface InitialProps {
    gameName: string;
    initialGame: GameStatus | null;
}

type SpecificKnowledge = { [role: string]: string[] };

function getKnowledge(game: GamePostStart, role: Role): SpecificKnowledge {
    const specificKnowldge: SpecificKnowledge = {};
    for (const knowledge of role.knows) {
        const existingKnowledge = specificKnowldge[knowledge.as] ?? [];
        for (const player of game.players) {
            if (player.role === knowledge.role) {
                existingKnowledge.push(player.name);
            }
        }
        specificKnowldge[knowledge.as] = existingKnowledge;
    }

    return specificKnowldge;
}

interface GameViewProps {
    game: GamePostStart;
    gameName: string;
    playerName: string;
}
const GameView: FC<GameViewProps> = () => {};

interface LobbyProps {
    game: GamePreStart;
    gameName: string;
    playerName: string;
    setPlayerName: (name: string) => void;
}
const Lobby: FC<LobbyProps> = ({ game, gameName, playerName, setPlayerName }) => {
    const { enqueueSnackbar } = useSnackbar();
};

const Game: NextPage<InitialProps> = ({ gameName, initialGame }) => {
    const { data: game, mutate } = useSWR<GameStatus | null>(`/api/${gameName}`, {
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
        return <Lobby game={game} gameName={gameName} playerName={name} setPlayerName={setName} />;
    } else {
        return <GameView game={game} gameName={gameName} playerName={name} />;
    }

    let role: Role | null = null;
    let roleDetails: ReactNode | null = null;
    let knowledgeDetails: ReactNode[] | null = null;
    let joined = false;
    let yourVote: boolean | null = null;
    let votesShown = false;
    let yesVotes: ReactNode | null = null;
    let noVotes: ReactNode | null = null;
    let numVoting = 0;
    let thoseVoting: ReactNode | null = null;
    let thoseNotVoting: ReactNode | null = null;
    let details: ReactNode | null = null;
    const roleSet: Set<string> = new Set();
    if (game?.status === 'poststart') {
        const you = game.players.find((p) => p.name === name);
        joined = !!you;

        game.players.forEach((e) => roleSet.add(e.role));
        const playerinfo: PlayerConfig = players_config[game.players.length];
        details = (
            <Box>
                <Box>
                    <Typography variant="caption">Players: {game.players.map((p) => p.name).join(', ')}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption">Roles: {[...roleSet.keys()].join(', ')}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption">
                        # Good People: {playerinfo.good}, # Bad People: {playerinfo.evil}
                    </Typography>
                </Box>
            </Box>
        );

        const voters = game.players.filter((p) => p.vote !== null).map((p) => p.name);
        thoseVoting = voters.join(', ');
        thoseNotVoting = game.players
            .filter((p) => p.vote === null)
            .map((p) => p.name)
            .join(', ');
        numVoting = voters.length;
        votesShown = game.voting !== null;
        if (votesShown && game.voting === 'private') {
            yesVotes = <Typography>{game.players.filter((p) => p.vote === true).length}</Typography>;
            noVotes = <Typography>{game.players.filter((p) => p.vote === false).length}</Typography>;
        } else if (votesShown && game.voting === 'public') {
            yesVotes = (
                <Typography>
                    {game.players
                        .filter((p) => p.vote === true)
                        .map((p) => p.name)
                        .join(', ')}
                </Typography>
            );
            noVotes = (
                <Typography>
                    {game.players
                        .filter((p) => p.vote === false)
                        .map((p) => p.name)
                        .join(', ')}
                </Typography>
            );
        }

        if (you) {
            role = roles_config[you?.role] ?? null;
            yourVote = you.vote;

            const kn = getKnowledge(game, role);
            knowledgeDetails = Object.keys(kn).map((role, i) => (
                <ListItem key={role}>
                    <Typography>
                        The following people are <strong>{role}</strong>: {kn[role].join(', ')}
                    </Typography>
                </ListItem>
            ));
        }
    } else if (game?.status === 'prestart') {
        const you = game.players.find((p) => p.name === name);
        joined = !!you;
    }
    if (role) {
        roleDetails = <Typography variant="h5">You are: {role.name}!</Typography>;
    }

    const vote = async (vote: boolean | null) => {
        try {
            await Axios.post(`/api/${gamename}/votes/${name}`, { vote });
            mutate();
        } catch (e) {
            enqueueSnackbar(`Error: ${e.response.data}`, { variant: 'error' });
        }
    };

    const showVote = async (mode: 'private' | 'public') => {
        try {
            await Axios.put(`/api/${gamename}/votes`, { mode });
            mutate();
        } catch (e) {
            enqueueSnackbar(`Error: ${e.response.data}`, { variant: 'error' });
        }
    };

    const clearVotes = async () => {
        try {
            await Axios.delete(`/api/${gamename}/votes`);
            mutate();
        } catch (e) {
            enqueueSnackbar(`Error: ${e.response.data}`, { variant: 'error' });
        }
    };

    const resetGame = async () => {
        try {
            await Axios.delete(`/api/${gamename}`);
            mutate();
        } catch (e) {
            enqueueSnackbar(`Error: ${e.response.data}`, { variant: 'error' });
        }
    };

    const allVoted = numVoting === (game?.players.length ?? 0);

    return (
        <Container>
            <Card>
                <CardContent>
                    <Accordion
                        expanded={!joined || game?.status === 'prestart'}
                        disabled={game?.status === 'poststart'}
                    >
                        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="join" id="join">
                            Join Game
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Box display="flex">
                                    <Box mx={2} display="flex">
                                        <TextField
                                            label="Your name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                        <Button
                                            color={joined ? 'secondary' : 'primary'}
                                            variant={joined ? 'outlined' : 'contained'}
                                            onClick={joined ? leave : join}
                                        >
                                            {joined ? 'Leave' : 'Join'}
                                        </Button>
                                    </Box>
                                    <Button
                                        color="secondary"
                                        variant="contained"
                                        onClick={start}
                                        disabled={((game as any)?.players.length ?? 0) < 5}
                                    >
                                        Start Game
                                    </Button>
                                </Box>
                                <Box>
                                    <Typography>
                                        Players: {(game as any)?.players.map((p) => p.name).join(', ')}
                                    </Typography>
                                </Box>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion disabled={!role} expanded={role && joined}>
                        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="yourrole" id="yourrole">
                            Your Role
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Box>{roleDetails}</Box>
                                <Box>
                                    {(knowledgeDetails ?? []).length > 0 ? (
                                        <Box>
                                            <Typography>You know:</Typography>
                                            <List>{knowledgeDetails}</List>
                                        </Box>
                                    ) : (
                                        <Typography>You don’t know anything special.</Typography>
                                    )}
                                </Box>
                                <Box mt={2}>{details}</Box>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion disabled={!role} expanded={role && joined}>
                        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="voting" id="voting">
                            Voting
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Box m={2}>
                                    <Box>Your vote: {yourVote === null ? '(No Vote)' : yourVote ? 'Yes' : 'No'}</Box>
                                    <Box>
                                        <Button variant="contained" color="primary" onClick={() => vote(true)}>
                                            Vote Yes
                                        </Button>
                                        <Button variant="contained" color="secondary" onClick={() => vote(false)}>
                                            Vote No
                                        </Button>
                                        <Button variant="contained" onClick={() => vote(null)}>
                                            Clear Vote
                                        </Button>
                                    </Box>
                                </Box>
                                <Box m={2}>
                                    <Button variant="contained" color="primary" onClick={() => showVote('private')}>
                                        Show Votes Privately
                                    </Button>
                                    <Button variant="contained" color="secondary" onClick={() => showVote('public')}>
                                        Show Votes Publicly
                                    </Button>
                                    <Button variant="contained" onClick={() => clearVotes()}>
                                        Reset Votes
                                    </Button>
                                </Box>
                                {votesShown ? (
                                    <Box m={2}>
                                        <Typography variant="h5">All Votes:</Typography>
                                        <Box>Yes: {yesVotes}</Box>
                                        <Box>No: {noVotes}</Box>
                                    </Box>
                                ) : (
                                    <Box m={2}>
                                        <Box>
                                            <Typography
                                                variant="subtitle2"
                                                color={allVoted ? 'textPrimary' : 'textSecondary'}
                                            >
                                                <strong>These people voted:</strong> {thoseVoting}
                                            </Typography>
                                        </Box>
                                        {!allVoted && (
                                            <Box>
                                                <Typography
                                                    variant="subtitle2"
                                                    color={allVoted ? 'textPrimary' : 'textSecondary'}
                                                >
                                                    <strong>These people haven’t voted:</strong> {thoseNotVoting}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion disabled={!role}>
                        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="control" id="control">
                            Game Control
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box>
                                <Button color="secondary" variant="contained" onClick={resetGame}>
                                    Reset Game
                                </Button>
                                <Button color="default" variant="contained" onClick={start}>
                                    Reset Roles
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </CardContent>
            </Card>
        </Container>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
        props: {
            gameName: context.query.gamename as string,
        },
    };
};

export default Game;
