"use client";

import { createContext, useContext, useState } from "react";
import { create } from "zustand";
import { GameResult, Trivia } from "@/lib/types";

const createStore = () =>
  create<{
    state: string;
    setState: (newState: string) => void;
    playersCount: number;
    setPlayersCount: (count: number) => void;
    roomId: string;
    setRoomId: (newRoomId: string) => void;
    trivia: Trivia;
    setTrivia: (trivia: Trivia) => void;
    roomSize: number;
    setRoomSize: (size: number) => void;
    roundEnded: boolean;
    setRoundEnded: (input: boolean) => void;
    leaveRoom: (socket: any, user: any) => void;
    triviaResult: GameResult;
    setTriviaResult: (results: GameResult) => void;
    resetQuestionTimer: boolean;
    setResetQuestionTimer: (value: boolean) => void;
    playerAfkCount: number;
    increasePlayerAfkCount: () => void;
  }>((set, get) => ({
    state: "Waiting",
    setState: (newState: string) => {
      set({ state: newState });
    },
    roomId: "",
    setRoomId: (newRoomId: string) => {
      set({ roomId: newRoomId });
    },
    playersCount: 0,
    setPlayersCount: (count: number) => {
      set({ playersCount: count });
    },
    trivia: {
      players: [],
      question: "",
      correctAnswer: "",
      options: [],
      round: 0,
      questionNo: 0,
    },
    setTrivia: (newTrivia: any) => {
      set({ trivia: newTrivia });
    },
    roomSize: 0,
    setRoomSize: (size: number) => {
      set({ roomSize: size });
    },
    roundEnded: false,
    setRoundEnded: (input: boolean) => {
      set({ roundEnded: input });
    },

    leaveRoom: (socket: any, user: any) => {
      const { trivia, roomId } = get();

      if (socket.connected && roomId && user) {
        console.log("User leaving", roomId);
        set({ roomId: "" });
        set({ state: "Waiting" });
        set({ playersCount: 0 });
        socket.emit("leaveRoom", { roomId, player: user, trivia });
      }
    },
    triviaResult: {
      roomId: "",
      playersPerformance: [],
      totalRounds: 0,
      winningPlayer: {
        userId: "",
        username: "",
        totalScore: 0,
        rounds: [],
        correctAnswers: 0,
        wrongAnswers: 0,
        averageTimePerRound: 0,
        finalPosition: 0,
        status: "left",
      },
      endTime: new Date(),
    },
    setTriviaResult: (results) => {
      set({ triviaResult: results });
    },
    resetQuestionTimer: false,
    setResetQuestionTimer: (value: boolean) => {
      set({ resetQuestionTimer: value });
    },
    playerAfkCount: 0,
    increasePlayerAfkCount: () => {
      console.log(get().playerAfkCount);
      set({ playerAfkCount: get().playerAfkCount + 1 });
    },
  }));

const TriviaContext = createContext<ReturnType<typeof createStore> | null>(
  null
);

export const useTrivia = () => {
  const store = useContext(TriviaContext);
  if (!store) throw new Error("useTrivia must be used within a TriviaProvider");

  return store;
};

const TriviaProvider = ({ children }: { children: React.ReactNode }) => {
  const [store] = useState(() => createStore());
  return (
    <TriviaContext.Provider value={store}>{children}</TriviaContext.Provider>
  );
};

export default TriviaProvider;
