import { Accordion, AccordionSummary, Typography, AccordionDetails, Box } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React, { FC } from 'react';

const History: FC = () => {
    return (
        <Accordion>
            <AccordionSummary id="accordion2-role" aria-controls="accordion2-role" expandIcon={<ExpandMore />}>
                <Typography variant="h5">History</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box textAlign="center" width="100%">
                    <Typography>History will be here, eventually</Typography>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default History;
