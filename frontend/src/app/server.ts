"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket;

if (typeof window !== "undefined") {
  socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms`, {
    ackTimeout: 10,
    extraHeaders: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
}

export { socket };
