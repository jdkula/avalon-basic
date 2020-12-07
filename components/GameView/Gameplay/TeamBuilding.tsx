import { Box, Button, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import useGame from '~/lib/useGame';
import useWithError from '~/lib/useWithError';

const TeamBuilding: FC = () => {
    const game = useGame();
    const withError = useWithError();

    return (
        <Box>
            <Box textAlign="center" mt={2}>
                <Typography>Need to put {game.requiredTeamSize} people on this team.</Typography>
                {game.failsRequired > 1 && (
                    <Typography>Need {game.failsRequired} fails to fail this mission.</Typography>
                )}
                <Box mt={2} />
                <Button
                    size="large"
                    variant="contained"
                    color="primary"
                    disabled={game.leader !== game.myName || game.team.length !== game.requiredTeamSize}
                    onClick={withError<never>(() => game.continue())}
                >
                    Submit Team
                </Button>
            </Box>
        </Box>
    );
};

export default TeamBuilding;
