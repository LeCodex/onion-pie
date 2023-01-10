import { Grid } from '@mui/material';
import { Container } from '@mui/system';
import HostPlayerComponent from './HostPlayerComponent';
import { Flipper } from 'react-flip-toolkit';

export default function HostPlayerList(props) {
    var orderedTokens = Object.keys(props.players).sort((a, b) => props.players[b].score - props.players[a].score);
    var started = props.turn > -1;

    var flipKey = `${JSON.stringify(orderedTokens.map(k => props.players[k].index))}-${props.turn}-${props.phase}`;

    return (
        <Container maxWidth="xl">
            <Flipper flipKey={flipKey} spring="veryGentle">
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12, lg: 20 }} padding={4}>
                    {orderedTokens.map((k, i) => 
                        <HostPlayerComponent key={props.players[k].index} position={i} token={k} started={started} player={props.players[k]} phase={props.phase} />
                    )}
                </Grid>
            </Flipper>
        </Container>
    );
}