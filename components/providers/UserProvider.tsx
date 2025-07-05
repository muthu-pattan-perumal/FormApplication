// components/providers/UserProvider.tsx
"use client";

import { ReactNode } from "react";
import { UserContext, UserType } from "../context/UserContext";

export default function UserProvider({
  user,
  children,
}: {
  user: UserType | null;
  children: ReactNode;
}) {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}
