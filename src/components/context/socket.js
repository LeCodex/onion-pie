import { createContext } from "react";
import io from "socket.io-client";
import { Snowflake } from "@theinternetfolks/snowflake";

export const token = Snowflake.generate()
export const socket = io({
    auth: {token: token},
});
export const SocketContext = createContext();