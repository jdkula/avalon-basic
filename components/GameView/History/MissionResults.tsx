import { ListItem, Box, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import TeamBoxes from '~/components/TeamBoxes';
import Votes from '~/components/Votes';
import { Mission } from '~/lib/db/models';
import useGame from '~/lib/useGame';

const MissionResults: FC<{ mission: Mission; num: number; roundNum: number }> = ({ mission, num, roundNum }) => {
    const game = useGame();
    const turnNumber =
        game.root.history.filter((_, i) => i < roundNum).reduce((total, round) => total + round.missions.length, 0) +
        num;
    const leader = game.players[turnNumber % game.players.length];
    const players: { name: string; vote: null | boolean }[] = game.players.map((p) => ({
        name: p,
        vote: mission.approved.includes(p),
    }));
    return (
        <ListItem divider key={num}>
            <Box textAlign="center" width="100%">
                <Typography>
                    Mission {num + 1} (Leader: {leader})
                </Typography>
                <TeamBoxes team={mission.team} onlySelected />
                <Votes show={true} sort={true} votes={players} />
            </Box>
        </ListItem>
    );
};

export default MissionResults;
