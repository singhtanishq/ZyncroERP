import React from "react";
import useAuth from "./useAuth";

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role !== "admin") {
    return <div className="p-6">Unauthorized Access</div>;
  }

  return children;
}