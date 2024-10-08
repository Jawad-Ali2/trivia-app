'use client'

import { createContext, useContext, useState } from "react";
import { create } from "zustand";

const createStore = () =>
  create<{
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    accessToken: string;
    setAccessToken: (value: string) => void;
    user: any;
    setUser: (value: any) => void;
  }>((set) => ({
    isAuthenticated: false,
    setIsAuthenticated: (value) => {
      set({ isAuthenticated: value });
    },
    accessToken: "",
    setAccessToken: (value) => {
      set({ accessToken: value });
    },
    user: {},
    setUser: (value) => {
      set({ user: value });
    },
  }));

const AuthContext = createContext<ReturnType<typeof createStore> | null>(null);

export const useAuth = () => {
  const store = useContext(AuthContext);

  if (!store) throw new Error("AuthContext must be used within AuthProvider");

  return store;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [store] = useState(() => createStore());

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
};


export default AuthProvider;