import {
    Card,
    CardContent,
    Typography,
    Box,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Grid,
    Divider,
} from '@material-ui/core';
import React, { FC, ReactNode } from 'react';
import GameSettings from '~/lib/GameSettings';
import useGame from '~/lib/useGame';
import TeamBoxes from './TeamBoxes';
import TeamBuilding from './TeamBuilding';
import Voting from './Voting';

const Gameplay: FC = () => {
    const game = useGame();

    let theGamePart: ReactNode;

    if (game.voting || game.votesShown) {
        theGamePart = <Voting />;
    } else {
        // Team is being selected by the current leader
        theGamePart = <TeamBuilding />;
    }

    const isFinalMission = game.currentRound.missions.length === GameSettings.get(game.players.length).voteTrackLength;

    return (
        <Card>
            <CardContent>
                <Box textAlign="center">
                    <Typography variant="srOnly">
                        <h6>{`Game Status: Round ${game.currentRoundNumber}, Mission ${
                            game.currentRound.missions.length
                        }.${isFinalMission ? ' Mission must pass or evil wins.' : ''} Mission leader is ${
                            game.leader
                        }`}</h6>
                    </Typography>
                    <Box aria-hidden="true" color={isFinalMission ? '#F00' : 'inherit'}>
                        <Grid container aria-hidden="true">
                            <Grid item xs={4}>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <Typography>Round</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {game.currentRoundNumber}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={4}>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <Typography>Leader</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {game.leader}
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={4}>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <Typography>Mission</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {game.currentRound.missions.length}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box mt={2} />
                    <Divider variant="middle" />
                    <Box mt={2} />
                    <Typography variant="h6" aria-label={`Current team is ${game.team.join(', ') || '(empty)'}`}>
                        Current Team:
                    </Typography>
                    <TeamBoxes />
                </Box>
                <Box>{theGamePart}</Box>
            </CardContent>
        </Card>
    );
};

export default Gameplay;
