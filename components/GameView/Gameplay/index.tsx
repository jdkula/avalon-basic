import { Card, CardContent, Typography, Box, Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import React, { FC } from 'react';
import useGame from '~/lib/useGame';
import TeamBuilding from './TeamBuilding';

const Gameplay: FC = () => {
    const game = useGame();

    let theGamePart;

    if (game.voting) {
    } else if (game.votesShown) {
    } else {
        // Team is being selected by the current leader
        theGamePart = <TeamBuilding />;
    }

    return (
        <Card>
            <CardContent>
                <Typography>Current lead is: {game.leader}</Typography>
                <Box>{theGamePart}</Box>
            </CardContent>
        </Card>
    );
};

export default Gameplay;
