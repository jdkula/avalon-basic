import { Card, CardContent, Typography, Box, Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import React, { FC, ReactNode } from 'react';
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

    return (
        <Card>
            <CardContent>
                <Box textAlign="center">
                    <Typography>Current Lead:</Typography>
                    <Typography variant="h6">{game.leader}</Typography>
                    <Typography>Current Team:</Typography>
                    <TeamBoxes />
                </Box>
                <Box>{theGamePart}</Box>
            </CardContent>
        </Card>
    );
};

export default Gameplay;
