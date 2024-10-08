"use client";

import { io, Socket } from "socket.io-client";

const at = localStorage.getItem("accessToken");

export const socket = io("http://localhost:8000/rooms", {
  ackTimeout: 10,
  retries: 5,
  extraHeaders: {
    Authorization: `Bearer ${at}`,
  },
});
