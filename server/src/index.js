import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import { logSafeError } from "./utils/httpErrors.js";

const app = express();
app.disable("x-powered-by");

// ========================================
// 1. CORS CONFIGURATION
// ========================================

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, "");
const configuredOrigins = (process.env.CLIENT_URL || "")
	.split(",")
	.map(normalizeOrigin)
	.filter(Boolean);
const allowedOrigins = [
	"https://civic-connect-1-8ieg.onrender.com",
	"http://localhost:5173",
	"http://127.0.0.1:5173",
	"http://localhost:4173",
	...configuredOrigins
].filter((origin, index, origins) => origins.indexOf(origin) === index);

const corsOptions = {
	origin: (origin, callback) => {
		if (!origin) {
			return callback(null, true);
		}

		const normalizedOrigin = normalizeOrigin(origin);

		if (allowedOrigins.includes(normalizedOrigin)) {
			return callback(null, true);
		}

		console.error("CORS blocked origin:", origin);
		return callback(null, false);
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	optionsSuccessStatus: 204
};

// ========================================
// 2. GLOBAL MIDDLEWARE
// ========================================

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ limit: "8mb", extended: true }));
app.use(morgan("dev"));

// ========================================
// 3. HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
	res.status(200).json({
		success: true,
		message: "CivicConnect Backend is running"
	});
});

app.get("/api/health", (req, res) => {
	res.status(200).json({
		success: true,
		message: "CivicConnect API is running",
		status: "healthy"
	});
});

// ========================================
// 4. API ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

// ========================================
// 5. 404 HANDLER
// ========================================

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: `Route not found: ${req.method} ${req.originalUrl}`
	});
});

// ========================================
// 6. GLOBAL ERROR HANDLER
// ========================================

app.use((error, req, res, next) => {
	logSafeError("Backend Error", error);

	if (error.type === "entity.parse.failed" || (error instanceof SyntaxError && "body" in error)) {
		return res.status(400).json({
			success: false,
			message: "Invalid JSON payload"
		});
	}

	if (error.type === "entity.too.large") {
		return res.status(413).json({
			success: false,
			message: "Request payload is too large"
		});
	}

	return res.status(error.status || 500).json({
		success: false,
		message: error.status ? error.message : "Internal Server Error"
	});
});

// ========================================
// 7. SERVER STARTUP
// ========================================

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
	console.error("MONGO_URI is missing");
	process.exit(1);
}

if (!process.env.JWT_SECRET) {
	console.error("JWT_SECRET is missing");
	process.exit(1);
}

connectDB(MONGO_URI)
	.then(() => {
		app.listen(PORT, () => {
			console.log("--------------------------------");
			console.log("CivicConnect Backend Started");
			console.log(`Port: ${PORT}`);
			console.log("MongoDB: Connected");
			console.log("Allowed Origins:", allowedOrigins);
			console.log("--------------------------------");
		});
	})
	.catch((error) => {
		logSafeError("Database connection failed", error);
		process.exit(1);
	});

export default app;
