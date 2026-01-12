import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => localStorage.getItem("cc_token") || "");
	const [user, setUser] = useState(() => {
		const raw = localStorage.getItem("cc_user");
		return raw ? JSON.parse(raw) : null;
	});

	useEffect(() => {
		if (token) localStorage.setItem("cc_token", token);
		else localStorage.removeItem("cc_token");
	}, [token]);

	useEffect(() => {
		if (user) localStorage.setItem("cc_user", JSON.stringify(user));
		else localStorage.removeItem("cc_user");
	}, [user]);

	const login = async (email, password) => {
		const { data } = await api.post("/auth/login", { email, password });
		setToken(data.token);
		setUser(data.user);
		return data;
	};

	const register = async (name, email, password, role) => {
		const { data } = await api.post("/auth/register", { name, email, password, role });
		setToken(data.token);
		setUser(data.user);
		return data;
	};

	const logout = () => {
		setToken("");
		setUser(null);
	};

	const value = useMemo(() => ({ token, user, isAuthenticated: !!token, login, register, logout }), [token, user]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}


