import { Chip, Avatar, Typography } from '@material-ui/core';
import { HourglassEmpty, Check, Clear, Adjust } from '@material-ui/icons';
import React, { FC, ReactNode } from 'react';
import FlexGridList from '~/components/FlexGridList';
import useGame from '~/lib/useGame';
import players from '~/pages/api/[gamename]/players';

const Votes: FC<{ showAll?: boolean; votes?: { name: string; vote: boolean | null }[] }> = ({ showAll, votes }) => {
    const game = useGame();

    let useVotes = votes ?? game.root.players;
    const yesVotes = useVotes.filter((p) => p.vote === true).map((p) => p.name);
    const noVotes = useVotes.filter((p) => p.vote === false).map((p) => p.name);

    if (game.votesShown === 'public') {
        useVotes = useVotes.sort((a, b) => (yesVotes.includes(a.name) ? -1 : 1) - (noVotes.includes(b.name) ? -1 : 1));
    }
    if (!votes && (game.votesShown === 'public' || game.voting === 'mission')) {
        useVotes = useVotes.filter((p) => game.team.includes(p.name));
    }

    const votingStatus = useVotes.map((player) => {
        let icon: ReactNode;
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
                aria-label={label}
            />
        );
    });

    return <FlexGridList role="group" aria-label="Current Voting Status" elements={votingStatus} />;
};

export default Votes;
