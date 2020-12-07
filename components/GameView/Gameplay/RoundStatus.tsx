import { Box, Grid, Typography } from '@material-ui/core';
import React, { FC } from 'react';

const RoundStatus: FC<{ isFinalMission: boolean; round: number; leader: string; mission: number }> = ({
    isFinalMission,
    round,
    leader,
    mission,
}) => (
    <Box aria-hidden="true" color={isFinalMission ? '#F00' : 'inherit'}>
        <Grid container aria-hidden="true">
            <Grid item xs={4}>
                <Grid container>
                    <Grid item xs={12}>
                        <Typography>Round</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {round}
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4}>
                <Grid container>
                    <Grid item xs={12}>
                        <Typography>Leader</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {leader}
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4}>
                <Grid container>
                    <Grid item xs={12}>
                        <Typography>Mission</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {mission}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    </Box>
);

export default RoundStatus;
