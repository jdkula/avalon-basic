import { Card, CardContent, Typography, Box, Divider } from '@material-ui/core';
import React, { FC, ReactNode } from 'react';
import useGame from '~/lib/useGame';
import useWithError from '~/lib/useWithError';
import TeamBoxes from '../../TeamBoxes';
import RoundStatus from './RoundStatus';
import TeamBuilding from './TeamBuilding';
import Voting from './Voting';

const Gameplay: FC = () => {
    const game = useGame();
    const withError = useWithError();
    const updateTeam = withError((e: string[]) => game.setTeam(e));

    let theGamePart: ReactNode;

    if (game.voting || game.votesShown) {
        theGamePart = <Voting />;
    } else {
        // Team is being selected by the current leader
        theGamePart = <TeamBuilding />;
    }

    let teamBoxes: ReactNode;
    if (game.voting || game.votesShown || game.myName !== game.leader) {
        teamBoxes = <TeamBoxes team={game.team} />;
    } else {
        teamBoxes = <TeamBoxes team={game.team} max={game.requiredTeamSize} updateTeam={updateTeam} />;
    }

    return (
        <Card>
            <CardContent>
                <Box textAlign="center">
                    <Typography variant="srOnly" component="h2" aria-live="polite" aria-atomic="true">
                        {`Game Status: Round ${game.currentRoundNumber}, Mission ${game.currentRound.missions.length}.${
                            game.isFinalMission ? ' Mission must pass or evil wins.' : ''
                        } Mission leader is ${game.leader}`}
                    </Typography>
                    <RoundStatus
                        isFinalMission={game.isFinalMission}
                        leader={game.leader}
                        mission={game.currentRound.missions.length}
                        round={game.currentRoundNumber}
                    />
                    <Box mt={2} />
                    <Divider aria-hidden="true" variant="middle" />
                    <Box mt={2} />
                    <Typography
                        variant="h6"
                        component="h3"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label={`Current Team: ${game.team.join(', ') || 'None'}`}
                    >
                        Current Team:
                    </Typography>
                    {teamBoxes}
                </Box>
                <Box>{theGamePart}</Box>
            </CardContent>
        </Card>
    );
};

export default Gameplay;
