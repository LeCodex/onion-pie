import { Box, CircularProgress, Grid, Grow, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useContext, useState, useEffect, useRef } from 'react';
import { SocketContext } from './context/socket';
import RollingTypography from './RollingTypography';

export default function OngoingGameComponent(props) {
    const socket = useContext(SocketContext);

    const [percent, setPercent] = useState(-1);
    const [goalPercent, setGoalPercent] = useState(-1);
    const [timer, setTimer] = useState(-1);
    const [maxTimer, setMaxTimer] = useState(-1);

    const timerInterval = useRef(null);

    const handlePercent = useCallback(data => {
        setPercent(data.percent);
    }, []);

    const handleGoalPercent = useCallback(data => {
        setGoalPercent(data.goalPercent);
    }, []);

    const handleTimer = useCallback(data => {
        setTimer(data.duration);
        setMaxTimer(data.duration);

        clearInterval(timerInterval.current);
        if (data.duration > -1) {
            timerInterval.current = setInterval(() => {
                setTimer(timer => timer > 0 ? timer - 0.1 : 0);
            }, 100);
        }
    }, []);

    useEffect(() => {
        socket.on("game:percent", handlePercent);
        socket.on("game:goal percent", handleGoalPercent);
        socket.on("game:timer", handleTimer);

        return () => {
            socket.off("game:percent", handlePercent);
            socket.off("game:goal percent", handleGoalPercent);
            socket.off("game:timer", handleTimer);
        }
    }, [socket, handlePercent, handleGoalPercent, handleTimer]);

    const phaseHeaders = {
        "questions": "Waiting for questions...",
        "answer": "What is your opinion?",
        "guess": props.currentPlayer.username + ", guess the answer!",
        "vote": "Is the real answer higher or lower?",
        "reveal": "And the right answer was..."
    }

    return (
        <Stack alignItems="center">
            <Typography 
                align='center' 
                variant="h5"
                position="absolute"
                right="3vw"
                top="3vh"
            >
                Game code: {props.gameID}
            </Typography>
            <Box m={2}>
                <Typography align='center' variant="h2">{props.question}</Typography>
                <Typography align='center' variant="h3">{phaseHeaders[props.phase] || ""}</Typography>
            </Box>
            <Grid container spacing={0} columns={12} alignItems="center" justifyContent="center">
                <Grid item xs={4}>
                    {
                        goalPercent > -1 
                        ? <RollingTypography 
                            fontSize={100} 
                            color="success.main" 
                            align="right"
                            value={goalPercent}
                            speed={3}
                            suffix="%"
                        />
                       : ""
                    }
                </Grid>
                <Grid item xs={4}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <CircularProgress 
                            variant={percent > -1 ? "determinate" : "indeterminate"} 
                            value={percent}
                            size="17vw"
                            color="white"
                            sx={{position: 'relative'}}
                        />
                        <CircularProgress 
                            variant={"determinate"} 
                            value={goalPercent > -1 ? goalPercent : 0}
                            size="15vw"
                            color="success"
                            sx={{position: 'absolute'}}
                        />
                        {
                            percent > -1 
                            ? <RollingTypography 
                                fontSize={100} 
                                sx={{position: "absolute"}}
                                speed={2}
                                value={Math.round(percent)}
                                suffix="%"
                            /> 
                            : <Typography fontSize={100} sx={{position: "absolute"}}>...</Typography>
                        }
                    </Box>
                </Grid>
                <Grid item xs={4}>
                    <Box
                        width="50%"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Grow in={timer > -1}>
                            <CircularProgress 
                                variant="determinate"
                                value={timer/maxTimer * 100}
                                size="10vw"
                                color="white"
                                sx={{position: 'relative'}}
                            />
                        </Grow>
                        <Typography 
                            fontSize={70}
                            sx={{position: "absolute"}}
                        >
                            {timer > -1 ? `${Math.floor(timer)}` : ""}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Stack>
    );
}