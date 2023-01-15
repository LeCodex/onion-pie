import { Box, Typography } from '@mui/material/';
import { useCallback, useContext, useEffect, useState } from 'react';
import { SocketContext, token } from './context/socket';
import PlayerPercentInput from './PlayerPercentInput';
import PlayerQuestionInput from './PlayerQuestionInput';
import PlayerAnswerInput from './PlayerAnswerInput';
import PlayerVoteInput from './PlayerVoteInput';

export default function PlayerInterface(props) {
    const socket = useContext(SocketContext);

    const [currentPlayer, setCurrent] = useState(false);

    const handleConnect = useCallback(() => {
        socket.emit("game:rejoin");
    }, [socket]);

    const handleCurrent = useCallback(data => {
        setCurrent(data.token === token);
    }, []);

    useEffect(() => {
        socket.on("connect", handleConnect);
        socket.on("game:current player", handleCurrent);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("game:current player", handleCurrent);
        }
    }, [socket, handleConnect, handleCurrent]);

    const phaseComponents = {
        questions: <PlayerQuestionInput />,
        answer: <PlayerAnswerInput />,
        guess: currentPlayer && <PlayerPercentInput />,
        vote: !currentPlayer && <PlayerVoteInput />
    }

    return (
        <Box>
            <Box m={2}>
                <Typography align='center' variant="h3">{props.username}</Typography>
                <Typography align='center' variant="h4">{props.gameID}</Typography>
                <Typography align='center' variant="h5">{props.question}</Typography>
            </Box>
            {phaseComponents[props.phase] || ""}
        </Box>
    )
}