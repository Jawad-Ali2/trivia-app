"use client";

import { createContext, useContext, useState } from "react";
import { create } from "zustand";
import { Trivia } from "@/lib/types";

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
  }>((set) => ({
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
      set({roundEnded: input});
    }
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
