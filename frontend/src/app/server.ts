"use client";

import { io, Socket } from "socket.io-client";

let socket : Socket;

if(typeof window !== 'undefined'){
  socket = io("http://localhost:8000/rooms", {
    ackTimeout: 10,
    extraHeaders: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

}

export {socket};