import { Accordion, AccordionSummary, Typography, AccordionDetails, Box, TextField } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import _ from 'lodash';
import React, { FC, useCallback, useState } from 'react';
import useGame from '~/lib/useGame';

const Notes: FC = () => {
    const game = useGame();
    const [notes, setNotes] = useState(game.myNotes);

    const debouncedUpdateNotes = useCallback(
        _.debounce(
            async (notes: string) => {
                await game.setNotes(notes);
            },
            250,
            { trailing: true },
        ),
        [],
    );

    const updateNotes = (notes: string) => {
        setNotes(notes);
        debouncedUpdateNotes(notes);
    };

    return (
        <Accordion>
            <AccordionSummary id="accordion2-role" aria-controls="accordion2-role" expandIcon={<ExpandMore />}>
                <Typography variant="h5" component="span">
                    Notes
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box textAlign="center" width="100%">
                    <TextField
                        multiline
                        rows={8}
                        fullWidth
                        label="Notes"
                        variant="outlined"
                        value={notes}
                        onChange={(e) => updateNotes(e.target.value)}
                    />
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default Notes;
