import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { isDuplicateKeyError, logSafeError, validationMessage } from "../utils/httpErrors.js";

const router = express.Router();

const generateToken = (userId) => {
	return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const publicUser = (user) => ({
	id: user._id,
	name: user.name,
	email: user.email,
	role: user.role
});

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

// POST /api/auth/register
router.post("/register", async (req, res) => {
	try {
		const name = String(req.body?.name || "").trim();
		const email = normalizeEmail(req.body?.email);
		const password = req.body?.password;

		if (!name || !email || !password) {
			return res.status(400).json({ message: "Name, email and password are required" });
		}

		if (typeof password !== "string" || password.length < 6) {
			return res.status(400).json({ message: "Password must be at least 6 characters" });
		}

		const existing = await User.findOne({ email });
		if (existing) {
			return res.status(409).json({ message: "Email already registered" });
		}

		const user = await User.create({ name, email, password, role: "user" });
		const token = generateToken(user._id);
		return res.status(201).json({
			user: publicUser(user),
			token
		});
	} catch (err) {
		logSafeError("Registration failed", err);
		if (isDuplicateKeyError(err)) {
			return res.status(409).json({ message: "Email already registered" });
		}
		const message = validationMessage(err);
		if (message) {
			return res.status(400).json({ message });
		}
		return res.status(500).json({ message: "Unable to register. Please try again." });
	}
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
	try {
		const email = normalizeEmail(req.body?.email);
		const password = req.body?.password;

		if (!email || !password) {
			return res.status(400).json({ message: "Email and password are required" });
		}

		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ message: "Invalid credentials" });

		const isMatch = await user.comparePassword(password);
		if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

		const token = generateToken(user._id);
		return res.json({ user: publicUser(user), token });
	} catch (err) {
		logSafeError("Login failed", err);
		return res.status(500).json({ message: "Unable to login. Please try again." });
	}
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
	return res.json({ user: publicUser(req.user) });
});

export default router;
