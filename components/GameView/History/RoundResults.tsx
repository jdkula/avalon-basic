import { Accordion, AccordionSummary, Typography, AccordionDetails, Box, Divider, List } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React, { FC, ReactNode } from 'react';
import SuccessChips from '~/components/SuccessChips';
import { Round } from '~/lib/db/models';
import GameSettings from '~/lib/GameSettings';
import useGame from '~/lib/useGame';
import MissionResults from './MissionResults';

const RoundResults: FC<{ round: Round; num: number; numPlayers: number }> = ({ round, num, numPlayers }) => {
    const game = useGame();

    const isCurrentRound = num === game.root.history.length - 1;

    const accordionId = `accordion_history_round_${num}`;
    const missionComplete = round.failed.length > 0 || round.succeeded.length > 0;
    const noConsensus = !isCurrentRound && !missionComplete;
    const delta = isCurrentRound ? -1 : 0;

    const missions = round.missions
        .slice(0, round.missions.length + delta)
        .map((mission, i) => <MissionResults key={i} mission={mission} num={i} />)
        .reverse();

    let result: ReactNode;
    let succeeded: boolean | null = null;
    if (noConsensus) {
        succeeded = false;
        result = 'Evil took this round due to indecision!';
    } else if (!missionComplete) {
        result = 'No missions have reached consensus yet!';
    } else {
        const failsToFail = GameSettings.get(numPlayers).quests[num].failsRequired;
        succeeded = round.failed.length < failsToFail;
        result = (
            <SuccessChips successes={round.succeeded.length} fails={round.failed.length} failsToFail={failsToFail} />
        );
    }

    const color = succeeded === null ? 'inherit' : succeeded ? 'primary' : 'secondary';
    const message = succeeded === null ? 'In progress' : succeeded ? 'Succeeded' : 'Failed';

    return (
        <Accordion>
            <AccordionSummary id={accordionId} aria-controls={accordionId} expandIcon={<ExpandMore />}>
                <Typography color={color}>
                    Round {num + 1} ({message})
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box width="100%">
                    {result}
                    <Box mt={2} />
                    <Divider variant="middle" />
                    <Box mt={2} />
                    <List>{missions}</List>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default RoundResults;
