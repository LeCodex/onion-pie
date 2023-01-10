import { Box, Button, Container, Slider, Stack } from "@mui/material";
import { useContext, useState } from "react";
import { SocketContext } from "./context/socket";

export default function PlayerPercentInput(props) {
    const socket = useContext(SocketContext);

    const [percent, setPercent] = useState(50)

    function handlePercentChange(event) {
        setPercent(event.target.value)
        socket.volatile.emit("game:guessUpdate", {guess: percent})
    }

    function handleSubmitClick(event) {
        socket.emit("game:guessSubmit", {guess: percent})
    }

    return (
        <Box component="form" autoComplete="off">
            <Stack spacing={2} justifyContent="center">
                <Container width={1}>
                    <Slider 
                        onChange={handlePercentChange} 
                        value={percent}
                        id="percent"
                        valueLabelDisplay="on"
                        min={0}
                        max={100}
                    />
                </Container>
                <Container>
                    <Button onClick={handleSubmitClick} id="submit" variant="contained" size="large">Submit</Button>
                </Container>
            </Stack>
        </Box>
    )
}