import { Card, Fade, Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useContext } from "react";
import { SocketContext } from "./context/socket";
import { Flipped } from 'react-flip-toolkit';
import RollingValueComponent from "./RollingTypography";

export default function HostPlayerComponent(props) {
    const socket = useContext(SocketContext);

    function handleCloseClick(event) {
        socket.emit("game:kick", {token: props.token});
    }

    const stateIcons = {
        submitted: "✅",
        current: "❔",
        higher: "🔼",
        lower: "🔽"
    };

    const cardColors = {
        submitted: ["rgba(0,209,13,0.8)", "rgba(0,118,41,0.8)"],
        current: ["rgba(255,131,255,0.8)", "rgba(172,0,150,0.8)"],
        higher: ["rgba(21,153,255,0.8)", "rgba(24,98,192,0.8)"],
        lower: ["rgba(190,97,6,0.8)", "rgba(227,25,19,0.8)"]
    };
    const cardColorGradient = props.player.state ? cardColors[props.player.state] : ["rgba(80,80,80,0.25)", "rgba(0,0,0,0.25)"];
    const textColor = "text.primary";

    var positionEmoji = "";
    if (props.position < 3) positionEmoji = ["🥇", "🥈", "🥉"][props.position] + " ";

    return (
        <Flipped flipId={props.player.index} stagger>
            <Fade in>
                <Grid item xs={4} alignItems="center" justifyContent="center">
                    <Card elevation={0} sx={{background: `linear-gradient(to right, ${cardColorGradient.join(',')})`, border: "1px solid rgba(255,255,255,0.4)"}}>
                        <Grid container spacing={4} padding={1} sx={{opacity: 1.0}}>
                            <Grid item xs={8} justifyContent="center" alignItems="center" zeroMinWidth>
                                <Typography sx={{ color: textColor, fontWeight: 600 }} variant="body1" noWrap>{positionEmoji}{props.player.username}</Typography>
                                <RollingValueComponent value={props.player.score} suffix=" pts"/>
                            </Grid>
                            <Grid item xs={4} justifyContent="center">
                                {
                                    props.player.state && stateIcons[props.player.state] && <Typography>{stateIcons[props.player.state]}</Typography>
                                }
                                {
                                    props.started ? "" : <IconButton edge="end" aria-label="delete" onClick={handleCloseClick}><CloseIcon /></IconButton>
                                }
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Fade>
        </Flipped>
    )
}