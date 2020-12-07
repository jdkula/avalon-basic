import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';
import React, { ChangeEvent, FC } from 'react';
import useGame from '~/lib/useGame';

interface TeamBoxesProps {
    team: string[];
    max?: number;
    updateTeam?: (newTeam: string[]) => void;
}

const TeamBoxes: FC<TeamBoxesProps> = ({ team, max, updateTeam }) => {
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

    const options = game.players.map((player) => (
        <Grid xs item key={player}>
            <FormControlLabel
                disabled={!updateTeam || (atMaxTeam && !team.includes(player))}
                control={<Checkbox checked={team.includes(player)} name={player} onChange={onSelectPlayer} />}
                label={player}
            />
        </Grid>
    ));

    return (
        <Grid container role="group" aria-label="Team-building Checkboxes">
            {options}
        </Grid>
    );
};

export default TeamBoxes;
