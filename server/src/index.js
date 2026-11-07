import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";

dotenv.config();

const app = express();
const configuredOrigins = (process.env.CLIENT_URL || "")
	.split(",")
	.map((origin) => origin.trim().replace(/\/+$/, ""))
	.filter(Boolean);
const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : ["http://localhost:5173"];
const corsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error("Origin is not allowed by CORS"));
	},
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
	optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
	res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

app.use((error, req, res, next) => {
	if (error?.message === "Origin is not allowed by CORS") {
		return res.status(403).json({ message: error.message });
	}
	return next(error);
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Start server after DB connect
if (!MONGO_URI) {
	console.error("MONGO_URI is required to start the server");
	process.exit(1);
}

if (!process.env.JWT_SECRET) {
	console.error("JWT_SECRET is required to start the server");
	process.exit(1);
}

connectDB(MONGO_URI)
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	})
	.catch((error) => {
		console.error("Server startup failed:", error.message);
		process.exit(1);
	});

export default app;
