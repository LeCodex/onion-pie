import { Box, Button, Container, Stack, TextField } from "@mui/material";
import { useContext, useState } from "react";
import { SocketContext } from "./context/socket";

export default function PlayerQuestionInput(props) {
    const socket = useContext(SocketContext);

    const [question, setQuestion] = useState("");

    function handleQuestionChange(event) {
        setQuestion(event.target.value);
    }

    function handleSubmitClick(event) {
        socket.emit("game:questionReturn", {question: question});
    }

    return (
        <Box component="form" autoComplete="off">
            <Stack spacing={2} justifyContent="center">
                <Container width={1}>
                    <TextField 
                        onChange={handleQuestionChange} 
                        value={question} 
                        id="question" 
                        label="Question" 
                        variant="outlined"   
                    />
                </Container>
                <Container>
                    <Button onClick={handleSubmitClick} id="submit" variant="contained" size="large">Submit</Button>
                </Container>
            </Stack>
        </Box>
    )
}