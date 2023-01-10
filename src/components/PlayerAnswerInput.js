import { Box, Button, Stack } from "@mui/material";
import { useContext } from "react";
import { SocketContext } from "./context/socket";

export default function PlayerAnswerInput(props) {
    const socket = useContext(SocketContext);

    function handleYesClick(event) {
        socket.emit("game:answer", {answer: true})
    }

    function handleNoClick(event) {
        socket.emit("game:answer", {answer: false})
    }

    return (
        <Box component="form" autoComplete="off">
            <Stack spacing={2} justifyContent="center">
                <Button onClick={handleYesClick} id="yes" variant="contained" size="large">Yes</Button>
                <Button onClick={handleNoClick} id="no" variant="contained" color="secondary" size="large">No</Button>
            </Stack>
        </Box>
    )
}