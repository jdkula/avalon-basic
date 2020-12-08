import { Box, Typography, Container } from '@material-ui/core';
import React, { FC } from 'react';
import useGame from '~/lib/useGame';
import GameInformation from './GameInformation';
import Gameplay from './Gameplay';
import History from './History';
import Notes from './Notes';
import RoleInformation from './RoleInformation';

const GameView: FC = () => {
    const game = useGame();

    let name = game.root._id.toLowerCase();
    name = name[0].toUpperCase() + name.substring(1); // sentence case

    return (
        <Container maxWidth="sm">
            <Box mt={4} />
            <Typography variant="h3" component="h1" align="center" gutterBottom>
                <strong>{name}</strong>’s Avalon Game
            </Typography>

            <GameInformation />
            <RoleInformation />
            <Box pt={2} />
            <Gameplay />
            <Box pt={2} />
            <History />
            <Notes />
        </Container>
    );
};

export default GameView;
