import { Box, Button, Stack } from "@mui/material";
import { useContext } from "react";
import { SocketContext } from "./context/socket";

export default function PlayerVoteInput(props) {
    const socket = useContext(SocketContext);

    function handleHigherClick(event) {
        socket.emit("game:vote", {vote: "higher"})
    }

    function handleLowerClick(event) {
        socket.emit("game:vote", {vote: "lower"})
    }

    return (
        <Box component="form" autoComplete="off">
            <Stack spacing={2} justifyContent="center">
                <Button onClick={handleHigherClick} id="higher" variant="contained" size="large">Higher 🔼</Button>
                <Button onClick={handleLowerClick} id="lower" variant="contained" color="secondary" size="large">Lower 🔽</Button>
            </Stack>
        </Box>
    )
}