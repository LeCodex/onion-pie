import Box from '@mui/material/Box';
import { useContext, useState, useCallback, useEffect } from 'react';
import { SocketContext } from './context/socket';
import HostInterface from './HostInterface';
import PlayerInterface from './PlayerInterface';


export default function GameInterface(props) {
    const socket = useContext(SocketContext);

    const [phase, setPhase] = useState("");
    const [question, setQuestion] = useState("");

    const handlePhase = useCallback(data => {
        setPhase(data.phase);
    }, []);

    const handleQuestion = useCallback(data => {
        setQuestion(data.question);
    }, []);

    useEffect(() => {
        socket.on("game:phase", handlePhase);
        socket.on("game:question", handleQuestion);

        return () => {
            socket.off("game:phase", handlePhase);
            socket.off("game:question", handleQuestion);
        }
    }, [socket, handlePhase, handleQuestion]);

    return (
        <Box>
            {
                props.host
                ? <HostInterface question={question} phase={phase} gameID={props.gameID} />
                : <PlayerInterface question={question} phase={phase} gameID={props.gameID} username={props.username}/>
            }
        </Box>
    )
}