import { Avatar, Box, Button, Chip, Grid, Typography } from '@material-ui/core';
import { Adjust, Check, CheckCircle, Clear, HourglassEmpty } from '@material-ui/icons';
import React, { FC, ReactNode } from 'react';
import FlexGridList from '~/components/FlexGridList';
import useGame from '~/lib/useGame';
import useWithError from '~/lib/useWithError';
import Votes from './Votes';

const Voting: FC = () => {
    const game = useGame();

    const withError = useWithError();

    const voteButtons = (
        <Grid container justify="space-around">
            <Grid item>
                <Button variant="contained" color="primary" onClick={withError(() => game.vote(true))}>
                    Vote Yes
                </Button>
            </Grid>
            <Grid item>
                <Button variant="contained" color="primary" onClick={withError(() => game.vote(false))}>
                    Vote No
                </Button>
            </Grid>
            <Grid item>
                <Button variant="outlined" onClick={withError(() => game.vote(null))}>
                    Clear Vote
                </Button>
            </Grid>
        </Grid>
    );

    return (
        <Box>
            <Typography>Voting:</Typography>
            <Box mt={2} />
            <Votes showAll={game.votesShown === 'public'} />
            {game.voting && game.allowedVoters.includes(game.myName) && voteButtons}
            {game.votesShown === 'private' && (
                <Grid container justify="space-around">
                    <Chip avatar={<Avatar>{game.yesVotes.length}</Avatar>} color="primary" label="Successes" />
                    <Chip avatar={<Avatar>{game.noVotes.length}</Avatar>} color="primary" label="Failures" />
                </Grid>
            )}
            <Box mt={2} />
            <Grid container justify="center">
                <Button
                    variant="outlined"
                    color="primary"
                    disabled={
                        game.leader !== game.myName ||
                        (!game.votesShown && game.voters.length !== game.allowedVoters.length)
                    }
                    onClick={withError(() => game.continue())}
                >
                    {game.voting ? 'Finish Voting' : 'Finish Discussing'}
                </Button>
            </Grid>
        </Box>
    );
};

export default Voting;
