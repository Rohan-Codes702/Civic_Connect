import axios from "axios";

const configuredBaseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const baseURL = /\/api$/i.test(configuredBaseURL) ? configuredBaseURL : `${configuredBaseURL}/api`;

const api = axios.create({
	baseURL,
	withCredentials: true,
	timeout: 20000
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("cc_token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error.response?.status;
		const requestUrl = error.config?.url || "";
		const isAuthEndpoint = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");
		if (status === 401 && !isAuthEndpoint) {
			localStorage.removeItem("cc_token");
			localStorage.removeItem("cc_user");
			if (window.location.pathname !== "/auth") {
				window.location.assign("/auth");
			}
		}
		return Promise.reject(error);
	}
);

export default api;
