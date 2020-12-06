import { Grid, Typography, Paper } from '@material-ui/core';
import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

const FlexGridListItemContainer = styled(Paper)<{ $gray?: boolean }>`
    padding: ${({ theme }) => theme.spacing(1)}px;
    background-color: ${({ $gray }) => ($gray ? '#f0f0f0' : '#fff')};
`;

export const FlexGridListItem: FC<{ item: ReactNode; even: boolean }> = ({ item, even }) => (
    <Grid item>
        {typeof item === 'string' ? (
            <FlexGridListItemContainer $gray={!even}>
                <Typography align="center">{item}</Typography>
            </FlexGridListItemContainer>
        ) : (
            item
        )}
    </Grid>
);

const FlexGridList: FC<{ elements: ReactNode[] }> = ({ elements }) => (
    <Grid container spacing={2} justify="space-around">
        {elements.map((el, i) => (
            <FlexGridListItem item={el} even={i % 2 === 0} key={i} />
        ))}
    </Grid>
);
export default FlexGridList;
