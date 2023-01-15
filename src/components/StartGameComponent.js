import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useContext, useState, useEffect, useCallback } from 'react';
import { SocketContext } from './context/socket';

export default function StartGameComponent(props) {
    const socket = useContext(SocketContext);

    const [canStart, setCanStart] = useState(false);

    const handlePlayerList = useCallback(data => {
        setCanStart(Object.keys(data.players).length >= 4);
    }, []);

    useEffect(() => {    
        socket.on("game:player list", handlePlayerList);
    
        return () => {
            socket.off("game:player list", handlePlayerList);
        }
    }, [socket, handlePlayerList]);

    function handleStartClick(event) {
        socket.emit("game:start");
    }

    return (
        <Stack spacing={2} margin={2} alignItems="center">
            <Typography variant="h3" mt="5%">Room code: {props.gameID}</Typography>
            <Button onClick={handleStartClick} disabled={!canStart} id="join" variant="contained" size="large">Start game</Button>
        </Stack>
    );
}