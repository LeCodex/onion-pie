import React, { useEffect, useState, useContext, useCallback } from "react";
import Container from '@mui/material/Container';
import GameInterface from "./GameInterface";
import JoinMenu from "./JoinMenu";
import { SocketContext } from "./context/socket";

export default function ClientComponent() {
  const socket = useContext(SocketContext)

  const [host, setHosting] = useState(false);
  const [gameID, setGameID] = useState(null);
  const [username, setUsername] = useState("");

  const handleJoined = useCallback(data => {
    setGameID(data.gameID);
    setHosting(false);
  }, []);

  const handleCreated = useCallback(data => {
    setGameID(data.gameID);
    setHosting(true);
  }, []);

  const handleQuit = useCallback(data => {
    setGameID(null);
  }, []);

  useEffect(() => {
    socket.on("game:joined", handleJoined);
    socket.on("game:created", handleCreated);
    socket.on("game:quit", handleQuit);

    return () => {
      socket.off("game:joined", handleJoined);
      socket.off("game:created", handleCreated);
      socket.off("game:quit", handleQuit);
    }
  }, [socket, handleJoined, handleCreated, handleQuit]);

  return (
    <Container maxWidth="xl">
      {
        gameID !== null
        ? <GameInterface gameID={gameID} host={host} username={username}/>
        : <JoinMenu setUsername={setUsername} username={username}/>
      }
    </Container>
  );
}