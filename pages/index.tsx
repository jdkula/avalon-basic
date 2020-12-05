import { Box, Button, Card, CardContent, CircularProgress, Container, TextField, Typography } from '@material-ui/core';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { SyntheticEvent, useState } from 'react';

const Index: NextPage = () => {
    const [working, setWorking] = useState(false);
    const [gameName, setGameName] = useState('');
    const router = useRouter();

    const go = (e: SyntheticEvent<any>) => {
        e.preventDefault();
        setWorking(true);
        router.push(`/game/${gameName}`);
    };

    return (
        <Container maxWidth="xs">
            <Box textAlign="center" pt={8}>
                <Typography variant="h2">Avalon-Basic</Typography>
                <Box pt={4} />
                <Card>
                    <CardContent>
                        <form onSubmit={go}>
                            <Box m={2}>
                                <TextField
                                    label="Game Name"
                                    value={gameName}
                                    onChange={(e) => setGameName(e.target.value)}
                                    variant="outlined"
                                />
                            </Box>
                            <Button onClick={go} disabled={working} variant="contained" color="primary">
                                {working ? <CircularProgress /> : 'Join Game'}
                            </Button>
                            <input type="submit" style={{ display: 'none' }} />
                        </form>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default Index;
