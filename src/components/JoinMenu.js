import { Container, Box, Button, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import { useContext, useState } from 'react';
import { SocketContext } from './context/socket';
import pie from './img/pie-microsoft.png';


export default function JoinMenu(props) {
    const socket = useContext(SocketContext);

    const [gameID, setGameID] = useState("");

    function handleJoinClick(event) {
        socket.emit("game:join", {username: props.username, gameID: gameID});
    }

    function handleCreateClick(event) {
        socket.emit("game:create", {username: props.username, gameID: gameID});
    }

    function handleGameIDChange(event) {
        var gameID = event.target.value.toUpperCase().slice(0, 4);
        setGameID(gameID);
    }

    function handleUsernameChange(event) {
        props.setUsername(event.target.value);
    }

    return (
        <Box component="form" autoComplete="off">
            <Stack spacing={2}>
                <Container sx={{display: "flex", justifyContent: 'center', marginTop:2}}>
                    <img src={pie} alt="Onion pie logo" />
                </Container>
                <Container sx={{display: "flex", justifyContent: 'center', gap: 2}} maxWidth="xl">
                    <TextField 
                        onChange={handleUsernameChange} 
                        value={props.username} 
                        id="username" 
                        label="Username" 
                        variant="outlined"   
                    />
                    <TextField 
                        onChange={handleGameIDChange} 
                        value={gameID} 
                        id="game-id" 
                        label="Game code" 
                        variant="outlined"
                    />
                </Container>
                <Container sx={{display: "flex", justifyContent: 'center', gap: 2}} maxWidth="xl">
                    <Button onClick={handleJoinClick} id="join" variant="contained" size="large">Join game</Button>
                    <Button onClick={handleCreateClick} id="create" variant="contained" size="large">Create game</Button>
                </Container>
            </Stack>
        </Box>
    )
}