"use client";

import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";

const createStore = () =>
  create<{
    socket: Socket | null;
    getSocket: () => Socket;
  }>((set, get) => ({
    socket: null,
    getSocket: () => {
      if (!get().socket && !get().socket?.connected && typeof window !== "undefined") {
        const socketIo : Socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/rooms`, {
          rejectUnauthorized: true,
          secure: true,
          ackTimeout: 10,
          extraHeaders: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        set({ socket: socketIo });
        return socketIo;
      } else {
        return get().socket as Socket;
      }
    },
  }));

const SocketContext = createContext<ReturnType<typeof createStore> | null>(
  null
);

export const useSocket = () => {
  const store = useContext(SocketContext);
  if (!store) throw new Error("useSocket must be used within a SocketProvider");

  return store;
};

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [store] = useState(() => createStore());

  return (
    <SocketContext.Provider value={store}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
