import { Accordion, AccordionSummary, Typography, AccordionDetails, Box, Button } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React, { FC } from 'react';
import useGame from '~/lib/useGame';
import useWithError from '~/lib/useWithError';
import FlexGridList from '../FlexGridList';

const GameInformation: FC = () => {
    const withError = useWithError();
    const game = useGame();

    return (
        <Accordion>
            <AccordionSummary id="accordion1-game" aria-controls="accordion1-game" expandIcon={<ExpandMore />}>
                <Typography variant="h5">Game Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box textAlign="center" width="100%">
                    <Typography>Players</Typography>
                    <FlexGridList elements={game.players} />
                    <Box mt={2} />
                    <Typography>Roles</Typography>
                    <FlexGridList elements={[...game.roles.keys()].sort()} />
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
                                    onClick={withError<never>(() => game.endGame())}
                                >
                                    End Game
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={withError<never>(() => game.rerollGame())}
                                >
                                    Reroll Game
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={withError<never>(() => game.resetGame())}
                                >
                                    Reset Game
                                </Button>
                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default GameInformation;
