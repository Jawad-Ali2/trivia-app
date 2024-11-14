"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket;

if (typeof window !== "undefined") {
  socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms`, {
    rejectUnauthorized: true,
    secure: true,

    ackTimeout: 10,
    extraHeaders: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
}

console.log("ldkjgagkljd")
export { socket };
