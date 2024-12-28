"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextValue {
  user: any; // or your custom user type
  jwt: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  registerUser: (email: string, username: string, password: string) => Promise<void>;
  updateUser: () => Promise<void>; // NEW
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  jwt: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  registerUser: async () => {},
  updateUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check localStorage for an existing token
    const storedToken = localStorage.getItem("jwt");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setJwt(storedToken);
      setUser(JSON.parse(storedUser));
    }

    // Once we've attempted to load from localStorage, loading is done.
    setLoading(false);
  }, []);

  // NEW: Function to fetch fresh user data from Strapi
  const updateUser = async () => {
    // If there is no token, we can’t fetch user data
    if (!jwt) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate=*`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user data.");
      }

      const data = await res.json();

      // Update state and localStorage with the latest user data
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      return user
    } catch (error) {
      console.error("updateUser error:", error);
    }
  };

  const login = async (identifier: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();

    if (res.ok && data.jwt) {
      setJwt(data.jwt);
      setUser(data.user);
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));

      // After login, fetch the latest user data from Strapi
      await updateUser();
    } else {
      throw new Error(data.error?.message || "Login failed");
    }
  };

  const registerUser = async (email: string, username: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();

    if (res.ok && data.jwt) {
      setJwt(data.jwt);
      setUser(data.user);
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));

      // After registration, fetch the latest user data from Strapi
      await updateUser();
    } else {
      throw new Error(data.error?.message || "Registration failed");
    }
  };

  const logout = () => {
    setJwt(null);
    setUser(null);
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, jwt, loading, login, logout, registerUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
