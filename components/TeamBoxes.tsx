import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';
import React, { ChangeEvent, FC } from 'react';
import useGame from '~/lib/useGame';

interface TeamBoxesProps {
    team: string[];
    onlySelected?: boolean;
    max?: number;
    updateTeam?: (newTeam: string[]) => void;
}

const TeamBoxes: FC<TeamBoxesProps> = ({ team, max, updateTeam, onlySelected }) => {
    const game = useGame();
    const atMaxTeam = max !== undefined && team.length >= max;

    const onSelectPlayer = (e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        if (!updateTeam) return;

        if (checked) {
            updateTeam([...team, e.target.name]);
        } else {
            updateTeam(team.filter((member) => member !== e.target.name));
        }
    };

    const players = onlySelected ? team : game.players;

    const options = players.map((player) => (
        <Grid xs item key={player}>
            <FormControlLabel
                disabled={!updateTeam || (atMaxTeam && !team.includes(player))}
                control={<Checkbox checked={team.includes(player)} name={player} onChange={onSelectPlayer} />}
                label={player}
            />
        </Grid>
    ));

    return (
        <Grid container role="group" aria-label={`Team Checkboxes. Selected: ${team.join(', ') || 'None'}`}>
            {options}
        </Grid>
    );
};

export default TeamBoxes;
