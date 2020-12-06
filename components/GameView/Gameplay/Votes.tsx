import { Chip, Avatar, Typography } from '@material-ui/core';
import { HourglassEmpty, Check, Clear, Adjust } from '@material-ui/icons';
import React, { FC, ReactNode } from 'react';
import FlexGridList from '~/components/FlexGridList';
import useGame from '~/lib/useGame';

const Votes: FC<{ showAll?: boolean }> = ({ showAll }) => {
    const game = useGame();

    const votingStatus = game.root.players
        .filter((p) => p.vote !== null || game.allowedVoters.includes(p.name))
        .map((player) => {
            let icon: ReactNode;
            const color = player.name === game.myName ? 'primary' : 'default';
            let label: string;
            if (player.vote === null) {
                icon = <HourglassEmpty fontSize="small" />;
                label = `${player.name}: Still voting`;
            } else if (player.name === game.myName || showAll) {
                icon = player.vote ? <Check fontSize="small" /> : <Clear fontSize="small" />;
                label = `${player.name}: Voted ${player.vote ? 'yes' : 'no'}`;
            } else {
                icon = <Adjust fontSize="small" />;
                label = `${player.name}: Vote has been counted`;
            }
            return (
                <Chip
                    avatar={<Avatar aria-hidden="true">{icon}</Avatar>}
                    label={
                        <Typography aria-hidden="true" variant="caption">
                            {player.name}
                        </Typography>
                    }
                    key={player.name}
                    color={color}
                    aria-label={label}
                />
            );
        });

    return <FlexGridList elements={votingStatus} />;
};

export default Votes;
