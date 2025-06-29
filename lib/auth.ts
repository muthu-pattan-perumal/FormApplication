// lib/auth.ts
import { cookies } from "next/headers";

export function getCurrentUser() {
  const cookie = cookies().get("auth_user");
  if (!cookie) return null;

  try {
    return JSON.parse(cookie.value); // { id, email }
  } catch {
    return null;
  }
}
