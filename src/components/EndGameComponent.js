import { Stack, Typography } from "@mui/material";

export default function EndGameComponent(props) {
    var winner = null;
    for (var player of Object.values(props.players)) {
        if (!winner || player.score > winner.score) {
            winner = player;
        }
    }

    return (
        <Stack spacing={2} margin={2} alignItems="center">
            <Typography variant="h2">{winner.username} wins!</Typography>
        </Stack>
    )
}