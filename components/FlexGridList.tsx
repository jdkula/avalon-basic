import { Grid, Typography, Paper } from '@material-ui/core';
import React, { FC } from 'react';
import styled from 'styled-components';

const FlexGridListItemContainer = styled(Paper)<{ $gray?: boolean }>`
    padding: ${({ theme }) => theme.spacing(1)}px;
    background-color: ${({ $gray }) => ($gray ? '#f0f0f0' : '#fff')};
`;

export const FlexGridListItem: FC<{ item: string; even: boolean }> = ({ item, even }) => (
    <Grid item sm>
        <FlexGridListItemContainer $gray={!even}>
            <Typography align="center">{item}</Typography>
        </FlexGridListItemContainer>
    </Grid>
);

const FlexGridList: FC<{ elements: string[] }> = ({ elements }) => (
    <Grid container spacing={2}>
        {elements.map((el, i) => (
            <FlexGridListItem item={el} even={i % 2 === 0} key={i} />
        ))}
    </Grid>
);
export default FlexGridList;
