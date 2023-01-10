import { Alert, Snackbar } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./context/socket";

export default function PlayerNotificationSnackbar() {
    const socket = useContext(SocketContext);

    const [message, setMessage] = useState("")
    const [open, setOpen] = useState(false)

    useEffect(() => {
        socket.on("game:message", message => {
            setMessage(message);
            setOpen(true);
        });
    
        return () => {
            socket.off("game:message");
        }
    }, [socket]);

    function handleClose(event, reason) {
        if (reason === 'clickaway') {
            return;
        }
      
        setOpen(false);
    };

    return (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert severity="info" onClose={handleClose}>{message}</Alert>
        </Snackbar>
    )
}