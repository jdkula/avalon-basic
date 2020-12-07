import { ListItem, Box, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import TeamBoxes from '~/components/TeamBoxes';
import Votes from '~/components/Votes';
import { Mission } from '~/lib/db/models';
import useGame from '~/lib/useGame';

const MissionResults: FC<{ mission: Mission; num: number }> = ({ mission, num }) => {
    const game = useGame();
    const players: { name: string; vote: null | boolean }[] = game.players.map((p) => ({
        name: p,
        vote: mission.approved.includes(p),
    }));
    return (
        <ListItem divider key={num}>
            <Box textAlign="center" width="100%">
                <Typography>Mission {num + 1}</Typography>
                <TeamBoxes team={mission.team} onlySelected />
                <Votes show={true} sort={true} votes={players} />
            </Box>
        </ListItem>
    );
};

export default MissionResults;
