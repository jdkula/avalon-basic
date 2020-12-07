import { Avatar, Box, Button, Chip, Grid, Typography } from '@material-ui/core';
import { Adjust, Check, CheckCircle, Clear, HourglassEmpty } from '@material-ui/icons';
import React, { FC, ReactNode } from 'react';
import FlexGridList from '~/components/FlexGridList';
import SuccessChips from '~/components/SuccessChips';
import GameSettings from '~/lib/GameSettings';
import useGame from '~/lib/useGame';
import useWithError from '~/lib/useWithError';
import Votes from './Votes';

const Voting: FC = () => {
    const game = useGame();

    const withError = useWithError();

    let noColor: 'primary' | 'secondary' = 'primary';
    if (game.currentRound.missions.length === GameSettings.get(game.players.length).voteTrackLength) {
        noColor = 'secondary';
    }
    const voteButtons = (
        <>
            <Typography variant="srOnly">
                <h6>Vote Buttons</h6>
            </Typography>
            <Grid container justify="space-around">
                <Grid item>
                    <Button
                        variant={game.myVote === true ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={withError(() => game.vote(true))}
                        aria-label={game.myVote === true ? 'You voted yes' : 'Change vote to yes'}
                    >
                        Vote Yes
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant={game.myVote === false ? 'contained' : 'outlined'}
                        color={noColor}
                        onClick={withError(() => game.vote(false))}
                        aria-label={game.myVote === false ? 'You voted no' : 'Change vote to no'}
                    >
                        Vote No
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant={game.myVote === null ? 'contained' : 'outlined'}
                        onClick={withError(() => game.vote(null))}
                        aria-label={game.myVote === null ? 'You haven’t voted' : 'Clear vote'}
                    >
                        Clear Vote
                    </Button>
                </Grid>
            </Grid>
        </>
    );

    return (
        <Box>
            <Typography variant="h6" align="center" aria-label="Voting Results">
                Voting:
            </Typography>
            <Box mt={2} />
            {(game.votesShown === false || game.votesShown === 'public') && (
                <Votes showAll={game.votesShown === 'public'} />
            )}
            <Box mt={2} />
            {game.voting && game.allowedVoters.includes(game.myName) && voteButtons}
            {game.votesShown === 'private' && (
                <SuccessChips successes={game.yesVotes.length} fails={game.noVotes.length} />
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
