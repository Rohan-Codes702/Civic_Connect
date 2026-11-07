import axios from "axios";

const configuredBaseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const baseURL = /\/api$/i.test(configuredBaseURL) ? configuredBaseURL : `${configuredBaseURL}/api`;

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("cc_token");
	if (token) {
		config.headers.Authorization = ["Bearer", token].join(" ");
	}
	return config;
});

export default api;
