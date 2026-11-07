import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

// Middleware
app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error("Origin is not allowed by CORS"));
	}
}));
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

