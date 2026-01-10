// frontend-spa/src/lib/auth/useAuth.js
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
