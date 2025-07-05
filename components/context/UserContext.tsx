"use client";

import { createContext, useContext } from "react";

export type UserType = {
  id: string;
  email: string;
};

export const UserContext = createContext<UserType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    console.warn("⚠️ useUser must be used inside a <UserProvider>");
  }
  return context;
};
