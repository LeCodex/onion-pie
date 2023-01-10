import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useContext, useState, useEffect } from 'react';
import { SocketContext } from './context/socket';
import RollingTypography from './RollingTypography';

export default function OngoingGameComponent(props) {
    const socket = useContext(SocketContext);

    const [percent, setPercent] = useState(-1);
    const [goalPercent, setGoalPercent] = useState(-1);
    const [timer, setTimer] = useState(-1);

    var timerInterval = null;

    const handlePercent = useCallback(data => {
        setPercent(data.percent);
    }, []);

    const handleGoalPercent = useCallback(data => {
        setGoalPercent(data.goalPercent);
    }, []);

    const handleTimer = useCallback(data => {
        setTimer(data.duration);
        clearInterval(timerInterval);
        if (data.duration > -1) {
            timerInterval = setInterval(() => {
                setTimer(timer => timer > 0 ? timer - 1 : 0);
            }, 1000);
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
                            sx = {{position: 'relative'}}
                        />
                        <CircularProgress 
                            variant={"determinate"} 
                            value={goalPercent > -1 ? goalPercent : 0}
                            size="15vw"
                            color="success"
                            sx = {{position: 'absolute'}}
                        />
                        <Typography fontSize={100} sx={{position: "absolute"}}>
                            {percent > -1 ? `${Math.round(percent)}%` : "..."}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={4}>
                    <Typography 
                        fontSize={100} 
                        color="text.secondary" 
                        align="left"
                    >
                        {timer > -1 ? `${Math.floor(timer)}` : ""}
                    </Typography>
                </Grid>
            </Grid>
        </Stack>
    );
}