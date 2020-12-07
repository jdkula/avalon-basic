import { Accordion, AccordionSummary, Typography, AccordionDetails, Box } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React, { FC } from 'react';
import useGame from '~/lib/useGame';
import RoundResults from './RoundResults';

const History: FC = () => {
    const game = useGame();

    const history = game.root.history
        .map((round, i) => <RoundResults key={i} round={round} num={i} numPlayers={game.players.length} />)
        .reverse();

    return (
        <Accordion>
            <AccordionSummary id="accordion2-role" aria-controls="accordion2-role" expandIcon={<ExpandMore />}>
                <Typography variant="h5" component="span">
                    History
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box textAlign="center" width="100%">
                    {history}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default History;
