import { Grid, FormControlLabel, Checkbox } from '@material-ui/core';
import React, { ChangeEvent, FC } from 'react';
import useGame from '~/lib/useGame';

const TeamBoxes: FC<{ team?: string[] }> = ({ team }) => {
    const game = useGame();
    const atMaxTeam = !!team || game.team.length >= game.requiredTeamSize;

    const useTeam = team || game.team;

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
        <Grid container aria-role="group" aria-label="Team-building Checkboxes">
            {game.players.map((player) => (
                <Grid xs item key={player}>
                    <FormControlLabel
                        disabled={
                            !!team ||
                            game.root.votingStatus !== null ||
                            game.leader !== game.myName ||
                            (!useTeam.includes(player) && atMaxTeam)
                        }
                        control={
                            <Checkbox checked={useTeam.includes(player)} name={player} onChange={onSelectPlayer} />
                        }
                        label={player}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default TeamBoxes;
