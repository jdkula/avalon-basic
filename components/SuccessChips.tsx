import { Grid, Chip, Avatar, Typography } from '@material-ui/core';
import React, { FC } from 'react';

const SuccessChips: FC<{ successes: number; fails: number; failsToFail: number }> = ({
    successes,
    fails,
    failsToFail,
}) => (
    <Grid container justify="space-around">
        <Chip
            avatar={<Avatar aria-hidden="true">{successes}</Avatar>}
            color={fails < failsToFail ? 'primary' : 'default'}
            label={
                <Typography variant="caption" aria-hidden="true">
                    Successes
                </Typography>
            }
            aria-label={`${successes} successes`}
        />
        <Chip
            avatar={<Avatar aria-hidden="true">{fails}</Avatar>}
            color={fails >= failsToFail ? 'secondary' : 'default'}
            label={
                <Typography variant="caption" aria-hidden="true">
                    Failures
                </Typography>
            }
            aria-label={`${fails} failures`}
        />
    </Grid>
);
export default SuccessChips;
