import { Box, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import React, { ChangeEvent, FC } from 'react';
import useGame from '~/lib/useGame';

const TeamBuilding: FC = () => {
    const game = useGame();
    const atMaxTeam = game.team.length >= game.requiredTeamSize;

    const onSelectPlayer = async (e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        let team = game.team;
        const name = e.target.name;
        if (checked) {
            team.push(name);
        } else {
            team = team.filter((existient) => existient !== name);
        }
        await game.setTeam(team);
    };

    return (
        <Box>
            <FormGroup>
                {game.players.map((player) => (
                    <FormControlLabel
                        key={player}
                        disabled={game.leader !== game.myName || (!game.team.includes(player) && atMaxTeam)}
                        control={
                            <Checkbox checked={game.team.includes(player)} name={player} onChange={onSelectPlayer} />
                        }
                        label={player}
                    />
                ))}
            </FormGroup>
        </Box>
    );
};

export default TeamBuilding;
