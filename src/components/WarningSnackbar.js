import { Alert, Snackbar } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./context/socket";

export default function WarningSnackbar(props) {
    const socket = useContext(SocketContext)

    const [message, setMessage] = useState("")
    const [open, setOpen] = useState(false)

    useEffect(() => {
        socket.on("disconnect", data => {
            setMessage("You disconnected, reconnecting...")
            setOpen(true)
        });

        socket.on("connect", data => {
            setOpen(false)
        })
    
        return () => {
            socket.off("disconnect");
            socket.off("connect");
        }
    }, [socket]);

    function handleClose(event, reason) {
        return;
    };
    
    return (
        <Snackbar open={open} onClose={handleClose}>
            <Alert severity="warning" onClose={handleClose}>{message}</Alert>
        </Snackbar>
    )
}