import { Accordion, AccordionSummary, Typography, AccordionDetails, Box } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React, { FC } from 'react';
import useGame from '~/lib/useGame';

const RoleInformation: FC = () => {
    const game = useGame();

    const knowledge = Object.keys(game.knowledge).map((role) => (
        <Box key={role} textAlign="left">
            <Typography>
                The following players are <strong>{role}: </strong>
                {game.knowledge[role].join(', ')}
            </Typography>
        </Box>
    ));

    return (
        <Accordion defaultExpanded>
            <AccordionSummary id="accordion2-role" aria-controls="accordion2-role" expandIcon={<ExpandMore />}>
                <Typography variant="h5" component="span">
                    Your Role
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box
                    textAlign="center"
                    width="100%"
                    role="region"
                    aria-label="Role Details"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <Typography component="h2">Your Role is: {game.myRole.name}</Typography>
                    <Box mt={2} />
                    {knowledge.length ? knowledge : 'You don’t know anything!'}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default RoleInformation;
