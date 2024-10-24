"use client";

import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useTrivia } from "./TriviaProvider";
import { createContext, useContext, useEffect, useState } from "react";

// "use client";
// let socket: Socket;

//   socket = io("http://localhost:8000/rooms", {
//     ackTimeout: 10,
//     extraHeaders: {
//       Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//     },
//   });
let at: string;
if (typeof window !== "undefined") {
  at = localStorage.getItem("accessToken") ?? "";
}

const createStore = () =>
  create<{
    socket: Socket;
    socketConnection: boolean;
    transport: string | null;
    initializeSocketListeners: (triviaStoreActions: any) => void;
    removeSocketListeners: () => void;
    emitSocketEvent: (eventName: string, payload: any) => void;
  }>((set, get) => {
    const socket = io("http://localhost:8000/rooms", {
      ackTimeout: 10,
      extraHeaders: {
        Authorization: `Bearer ${at}`,
      },
    });

    return {
      socket: socket,
      socketConnection: false,
      transport: null,
      emitEvent: (event: any, data: any) => {
        socket.emit(event, data);
      },

      initializeSocketListeners: (triviaStoreActions) => {
        const socket = get().socket;
        //   if (!triviaStoreActions.roomId || triviaStoreActions.roomId === "") {
        //     console.log("ldkjga;lkgjdklg");
        //     socket.emit("joinRoom", {
        //       player: JSON.parse(localStorage.getItem("user") ?? ""),
        //     });
        //   }
        console.log(socket);
        // if (socket?.connected) {
        socket.on("connect", () => {
          console.log("connection");
          set({ socketConnection: true });
          set({ transport: socket.io.engine.transport.name });
          socket.io.engine.on("upgrade", (transport) => {
            set({ transport: transport.name });
          });
        });

        socket.on("disconnect", () => {
          console.log("disconnecting sokcet");
          set({ socketConnection: false });
          set({ transport: null });
        });

        socket.on("playerJoined", (players) => {
          console.log(" player Joined the game");

          triviaStoreActions.setPlayersCount(players.players.length);
          triviaStoreActions.setTrivia({
            players: players.players,
            correctAnswer: "0",
            round: "0",
          });

          socket.on("roomJoined", ({ roomId, players, roomSize }) => {
            console.log(" Joined the game");

            const updatedPlayers = players.map((player: any) => ({
              playerId: player.userId,
              username: player.username,
              score: "0",
              correctAnswers: 0,
              wrongAnswers: 0,
              position: "0",
            }));

            triviaStoreActions.setRoomId(roomId);
            triviaStoreActions.setRoomSize(roomSize);
            // Add more params here
            triviaStoreActions.setTrivia({
              players: updatedPlayers,
              correctAnswer: "0",
              round: "0",
            });
          });

          socket.on("startGame", ({ roomId, players, question }) => {
            console.log("START GAME");
            triviaStoreActions.setRoomId(roomId);
            triviaStoreActions.setTrivia({
              players: players,
              correctAnswer: "0",
              round: "0",
            });
            triviaStoreActions.setState("In Progress");
          });
        });
        // }
      },

      removeSocketListeners: () => {
        if (socket?.connected) {
          socket.off("connect");
          socket.off("disconnect");
          socket.off("roomJoined");
          socket.off("playerJoined");
          socket.off("startGame");
          socket.off("joinRoom");
        }
      },

      emitSocketEvent: (eventName, payload) => {
        if (socket?.connected) {
          socket.emit(eventName, payload);
        }
      },
    };
  });

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
