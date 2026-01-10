import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api, { ensureCsrf } from "../api/apiClient";

export const AuthContext = createContext(null);

function parseSafe(data) {
  if (!data) return null;

  if (typeof data === "string") {
    try {
      const cleaned = data.replace(/^\uFEFF/, "").trim(); 
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
  return data;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (newUser) => {
    setUser(newUser);
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get("/user");
      const parsed = parseSafe(res?.data);

      if (parsed && typeof parsed === "object") {
        setUser(parsed);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const publicPaths = ["/attendance", "/login"];

    const isPublic = publicPaths.some((p) =>
      window.location.pathname.startsWith(p)
    );

    if (isPublic) {
      refreshUser(); 
      return;
    }

    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    await ensureCsrf();

    let res;
    try {
      res = await api.post("/login-check", { email, password });
    } catch (err) {
      let raw = err?.response?.data;
      let parsed = parseSafe(raw);

      const message =
        parsed?.message ??
        parsed?.errors?.email?.[0] ??
        "Invalid credentials";

      throw new Error(message);
    }

    const parsed = parseSafe(res?.data);
    return parsed?.user ?? null;
  }, []);

  const loginComplete = useCallback(async () => {
    await ensureCsrf();

    const res = await api.post("/login-complete");
    await refreshUser();

    const parsed = parseSafe(res?.data);
    return parsed?.user ?? null;
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await ensureCsrf();
    await api.post("/logout");

    setUser(null);
    delete api.defaults.headers.common["X-XSRF-TOKEN"];
  }, []);

  const value = {
    user,
    loading,
    login, 
    loginComplete, 
    logout,
    refreshUser,
    setUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

