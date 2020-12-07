import { Chip, Avatar, Typography } from '@material-ui/core';
import { HourglassEmpty, Check, Clear, Adjust } from '@material-ui/icons';
import React, { FC, ReactNode } from 'react';
import FlexGridList from '~/components/FlexGridList';

const Votes: FC<{ show?: string | boolean; sort?: boolean; votes: { name: string; vote: boolean | null }[] }> = ({
    show,
    votes,
    sort,
}) => {
    const yesVotes = votes.filter((p) => p.vote === true).map((p) => p.name);
    const noVotes = votes.filter((p) => p.vote === false).map((p) => p.name);

    if (sort) {
        votes = votes.sort((a, b) => (yesVotes.includes(a.name) ? -1 : 1) - (noVotes.includes(b.name) ? -1 : 1));
    }

    const votingStatus = votes.map((player) => {
        let icon: ReactNode;
        let label: string;
        if (player.vote === null) {
            icon = <HourglassEmpty fontSize="small" />;
            label = `${player.name}: Still voting`;
        } else if (player.name === show || show === true) {
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
                aria-label={label}
            />
        );
    });

    return <FlexGridList role="group" aria-label="Votes" elements={votingStatus} />;
};

export default Votes;
