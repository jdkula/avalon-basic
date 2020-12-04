import { Box, Button, Card, CardContent, CircularProgress, Container, TextField } from '@material-ui/core';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

const Index: NextPage = () => {
    const [working, setWorking] = useState(false);
    const [gameName, setGameName] = useState('');
    const router = useRouter();

    const go = () => {
        setWorking(true);
        router.push(`/game/${gameName}`);
    };

    return (
        <Container>
            <Box textAlign="center">
                <Card>
                    <CardContent>
                        <form onSubmit={go}>
                            <Box m={2}>
                                <TextField
                                    label="Game name"
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
