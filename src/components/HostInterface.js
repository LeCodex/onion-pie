import { Stack } from '@mui/system';
import { useState, useContext, useEffect, useCallback } from 'react';
import { SocketContext } from './context/socket';
import StartGameComponent from './StartGameComponent';
import OngoingGameComponent from './OngoingGameComponent';
import HostPlayerList from './HostPlayerList';
import { Paper } from '@mui/material';

import Image from './img/background.jpg';

export default function HostInterface(props) {
    const socket = useContext(SocketContext);

    const [order, setOrder] = useState([]);
    const [turn, setTurn] = useState(-1);
    const [players, setPlayers] = useState({});

    const handleStarted = useCallback(data => {
        console.log("started!")
        setOrder(data.order);
        setTurn(0);
    }, []);

    const handlePlayerList = useCallback(data => {
        setPlayers(data.players);
    }, []);

    const handleTurn = useCallback(data => {
        setTurn(data.turn);
    }, []);

    const handleEnded = useCallback(data => {
        setTurn(-1);
    }, []);

    useEffect(() => {
        socket.on("game:started", handleStarted);
        socket.on("game:player list", handlePlayerList);
        socket.on("game:ended", handleEnded);
        socket.on("game:turn", handleTurn);

        return () => {
            socket.off("game:started", handleStarted);
            socket.off("game:player list", handlePlayerList);
            socket.off("game:ended", handleEnded);
            socket.off("game:turn", handleTurn); 
        }
    }, [socket, handleStarted, handlePlayerList, handleEnded, handleTurn]);

    const styles = {
        paperContainer: {
            backgroundImage: `url(${Image})`
        }
    };

    return (
        <Paper style={styles.paperContainer} sx={{left: 0, up: 0, position: "absolute", width: "100vw", height:"100vh", backgroundSize: "100vw 100vh"}}>
            <Stack justifyContent="center">
                {
                    turn > -1
                    ? <OngoingGameComponent question={props.question} phase={props.phase} currentPlayer={Object.values(players).filter(e => e.index === order[turn])[0]} />
                    : <StartGameComponent gameID={props.gameID} />
                }
                <HostPlayerList players={players} turn={turn} phase={props.phase}/>
            </Stack>
        </Paper>
    )
}