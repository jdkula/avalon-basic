import { Grid, Chip, Avatar } from '@material-ui/core';
import React, { FC } from 'react';

const SuccessChips: FC<{ successes: number; fails: number }> = ({ successes, fails }) => (
    <Grid container justify="space-around">
        <Chip avatar={<Avatar>{successes}</Avatar>} color="primary" label="Successes" />
        <Chip avatar={<Avatar>{fails}</Avatar>} color="primary" label="Failures" />
    </Grid>
);
export default SuccessChips;
