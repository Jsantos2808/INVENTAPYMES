import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "../api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Company {
  id: string;
  name: string;
}

interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    companyName: string,
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          setUser(res.data.user);
          setCompany(res.data.company);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    setCompany(res.data.company);
  };

  const register = async (
    companyName: string,
    name: string,
    email: string,
    password: string
  ) => {
    const res = await api.post("/auth/register", {
      companyName,
      name,
      email,
      password,
    });
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    setCompany(res.data.company);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, company, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
