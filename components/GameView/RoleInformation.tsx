import { Accordion, AccordionSummary, Typography, AccordionDetails, Box, List, ListItem } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React, { FC } from 'react';
import useGame from '~/lib/useGame';

const RoleInformation: FC = () => {
    const game = useGame();

    const knowledge = Object.keys(game.knowledge).map((role) => (
        <Box key={role} textAlign="left">
            <Typography>
                The following players are <strong>{role}:</strong>
            </Typography>
            <List>
                {game.knowledge[role].map((player) => (
                    <ListItem key={player}>{player}</ListItem>
                ))}
            </List>
        </Box>
    ));

    return (
        <Accordion defaultExpanded>
            <AccordionSummary id="accordion2-role" aria-controls="accordion2-role" expandIcon={<ExpandMore />}>
                <Typography variant="h5">Your Role</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box textAlign="center" width="100%">
                    <Typography>Your Role is: {game.myRole.name}</Typography>
                    {knowledge.length ? knowledge : 'You don’t know anything!'}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default RoleInformation;
