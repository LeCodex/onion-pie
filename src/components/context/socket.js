import { createContext } from "react";
import io from "socket.io-client";
import { Snowflake } from "@theinternetfolks/snowflake";
const ENDPOINT = "http://192.168.1.176:4001";

export const token = Snowflake.generate()
export const socket = io(ENDPOINT, {
    auth: {token: token},
});
export const SocketContext = createContext();