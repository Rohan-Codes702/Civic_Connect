
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";

dotenv.config();

const app = express();

// ========================================
// 1. CORS CONFIGURATION
// ========================================

const configuredOrigins = [
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean)
];
const allowedOrigins = configuredOrigins.length > 0
  ? configuredOrigins
  : ["http://localhost:5173"];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error("CORS blocked origin:", origin);

    return callback(
      new Error("Origin is not allowed by CORS")
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ],

  optionsSuccessStatus: 204
};

// ========================================
// 2. GLOBAL MIDDLEWARE
// ========================================

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "50mb" }));

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true
  })
);

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
  console.error("Backend Error:", error);

  if (error.message === "Origin is not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS origin not allowed"
    });
  }

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error"
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
    console.error("Database connection failed:", error);
    process.exit(1);
  });

export default app;
