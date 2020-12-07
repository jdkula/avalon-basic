import {
    Accordion,
    AccordionSummary,
    Typography,
    AccordionDetails,
    Box,
    Divider,
    ListItem,
    List,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React, { FC, Fragment } from 'react';
import useGame from '~/lib/useGame';
import SuccessChips from '../SuccessChips';
import TeamBoxes from './Gameplay/TeamBoxes';
import Votes from './Gameplay/Votes';

const History: FC = () => {
    const game = useGame();

    const history = game.root.history.map((round, i) => {
        const accordionId = `accordion_history_round_${i}`;
        const missionComplete = round.failed.length > 0 || round.succeeded.length > 0;
        const delta = i === game.root.history.length - 1 ? -1 : 0;

        const missions = round.missions.slice(0, round.missions.length + delta).map((mission, i) => {
            const players: { name: string; vote: null | boolean }[] = game.players.map((p) => ({
                name: p,
                vote: mission.approved.includes(p),
            }));
            return (
                <Fragment key={i}>
                    <ListItem button>
                        <Box textAlign="center">
                            <Typography>Mission {i + 1}</Typography>
                            <TeamBoxes team={mission.team} />
                            <Votes showAll={true} votes={players} />
                        </Box>
                    </ListItem>
                    <Divider variant="middle" />
                </Fragment>
            );
        });

        return (
            <Accordion key={i}>
                <AccordionSummary id={accordionId} aria-controls={accordionId} expandIcon={<ExpandMore />}>
                    <Typography>Round {i + 1}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box width="100%">
                        {missionComplete ? (
                            <SuccessChips successes={round.succeeded.length} fails={round.failed.length} />
                        ) : (
                            'No missions have reached consensus yet!'
                        )}
                        <Box mt={2} />
                        <Divider variant="middle" />
                        <Box mt={2} />
                        <List>{missions}</List>
                    </Box>
                </AccordionDetails>
            </Accordion>
        );
    });

    return (
        <Accordion>
            <AccordionSummary id="accordion2-role" aria-controls="accordion2-role" expandIcon={<ExpandMore />}>
                <Typography variant="h5">History</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box textAlign="center" width="100%">
                    {history}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default History;
