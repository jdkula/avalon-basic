import { Box, Button, Grid, Typography } from '@material-ui/core';
import React, { FC, ReactNode } from 'react';
import SuccessChips from '~/components/SuccessChips';
import useGame from '~/lib/useGame';
import useWithError from '~/lib/useWithError';
import Votes from '../../Votes';

const Voting: FC = () => {
    const game = useGame();

    const withError = useWithError();

    let noLabel = game.myVote === false ? 'You voted no' : 'Change vote to no';
    if (game.isFinalMission) {
        noLabel += ' (Passing this mission will cause evil to win!)';
    }
    const voteButtons = (
        <>
            <Typography variant="srOnly" component="h3">
                Vote Buttons
            </Typography>
            <Grid container justify="space-around">
                <Grid item>
                    <Button
                        variant={game.myVote === true ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={withError<never>(() => game.vote(true))}
                        aria-label={game.myVote === true ? 'You voted yes' : 'Change vote to yes'}
                    >
                        Vote Yes
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant={game.myVote === false ? 'contained' : 'outlined'}
                        color={game.isFinalMission ? 'secondary' : 'primary'}
                        onClick={withError<never>(() => game.vote(false))}
                        aria-label={noLabel}
                    >
                        Vote No
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant={game.myVote === null ? 'contained' : 'outlined'}
                        onClick={withError<never>(() => game.vote(null))}
                        aria-label={game.myVote === null ? 'You haven’t voted' : 'Clear vote'}
                    >
                        Clear Vote
                    </Button>
                </Grid>
            </Grid>
        </>
    );

    let votesView: ReactNode;
    if (game.votesShown === false || game.votesShown === 'public') {
        const votes = game.root.players.filter((p) => game.allowedVoters.includes(p.name));
        votesView = <Votes show={!!game.votesShown || game.myName} sort={game.votesShown === 'public'} votes={votes} />;
    } else {
        // viewing results of a mission.
        votesView = (
            <SuccessChips
                successes={game.yesVotes.length}
                fails={game.noVotes.length}
                failsToFail={game.failsRequired}
            />
        );
    }

    const canContinue =
        (game.root.votingStatus === null && game.myName === game.leader) ||
        (game.voting && game.myName === game.leader && game.voters.length === game.allowedVoters.length) ||
        game.votesShown;

    return (
        <Box>
            <Typography variant="h6" align="center" aria-label="Voting Results">
                Voting:
            </Typography>
            <Box mt={2} />
            {votesView}
            <Box mt={2} />
            {game.voting && game.allowedVoters.includes(game.myName) && voteButtons}
            <Box mt={2} />
            <Grid container justify="center">
                <Button
                    variant="outlined"
                    color="primary"
                    disabled={!canContinue}
                    onClick={withError<never>(() => game.continue())}
                >
                    {game.voting ? 'Finish Voting' : 'Finish Discussing'}
                </Button>
            </Grid>
        </Box>
    );
};

export default Voting;
