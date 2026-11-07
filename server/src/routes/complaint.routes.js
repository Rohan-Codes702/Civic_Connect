import express from "express";
import mongoose from "mongoose";
import Complaint from "../models/Complaint.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { logSafeError, validationMessage } from "../utils/httpErrors.js";

const router = express.Router();

const ALLOWED_SORT = new Set(["createdAt", "-createdAt", "title", "-title", "status", "-status"]);
const ALLOWED_STATUS = new Set(["open", "in_progress", "resolved"]);
const ALLOWED_OWNER_FIELDS = ["title", "description", "category", "location", "latitude", "longitude", "photos"];

const parsePagination = (query) => {
	const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
	const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 10));
	const sort = ALLOWED_SORT.has(query.sort) ? query.sort : "-createdAt";
	return { page, limit, sort };
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const canAccessComplaint = (complaint, user) =>
	user.role === "admin" || complaint.user.toString() === user._id.toString();

const sanitizePhotos = (photos) => {
	if (!Array.isArray(photos)) return [];
	return photos
		.slice(0, 5)
		.map((photo) => {
			const url = typeof photo === "string" ? photo : photo?.url || photo?.path;
			if (typeof url !== "string") return null;
			const trimmed = url.trim();
			if (!trimmed.startsWith("data:image/") && !/^https?:\/\//i.test(trimmed)) return null;
			if (trimmed.startsWith("data:image/") && trimmed.length > 1_500_000) return null;
			return { url: trimmed };
		})
		.filter(Boolean);
};

// GET /api/complaints - Admin gets all, user gets own, with filters & pagination
router.get("/", protect, async (req, res) => {
	try {
		const isAdmin = req.user.role === "admin";
		const { page, limit, sort } = parsePagination(req.query);
		const { status, category, q } = req.query;

		const match = {};
		if (!isAdmin) match.user = req.user._id;
		if (status && ALLOWED_STATUS.has(status)) match.status = status;
		if (category) match.category = String(category).trim();
		if (q) {
			const search = String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			if (search) {
				match.$or = [
					{ title: { $regex: search, $options: "i" } },
					{ description: { $regex: search, $options: "i" } }
				];
			}
		}

		const skip = (page - 1) * limit;
		let findQuery = Complaint.find(match).sort(sort).skip(skip).limit(limit);
		if (isAdmin) {
			findQuery = findQuery.populate({ path: "user", select: "name email role" });
		}

		const [items, total] = await Promise.all([
			findQuery,
			Complaint.countDocuments(match)
		]);

		res.json({
			items,
			total,
			page,
			pages: Math.max(1, Math.ceil(total / limit) || 1)
		});
	} catch (err) {
		logSafeError("List complaints failed", err);
		res.status(500).json({ message: "Server error" });
	}
});

// GET /api/complaints/stats/summary - admin stats
router.get("/stats/summary", protect, requireAdmin, async (req, res) => {
	try {
		const [total, open, inProgress, resolved] = await Promise.all([
			Complaint.countDocuments({}),
			Complaint.countDocuments({ status: "open" }),
			Complaint.countDocuments({ status: "in_progress" }),
			Complaint.countDocuments({ status: "resolved" })
		]);
		res.json({ total, open, inProgress, resolved });
	} catch (err) {
		logSafeError("Complaint stats failed", err);
		res.status(500).json({ message: "Server error" });
	}
});

// GET /api/complaints/:id
router.get("/:id", protect, async (req, res) => {
	try {
		if (!isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: "Invalid complaint id" });
		}
		const complaint = await Complaint.findById(req.params.id).populate({
			path: "user",
			select: "name email role"
		});
		if (!complaint) return res.status(404).json({ message: "Complaint not found" });
		if (!canAccessComplaint(complaint, req.user)) {
			return res.status(403).json({ message: "Forbidden" });
		}
		if (req.user.role !== "admin") {
			const payload = complaint.toObject();
			delete payload.user;
			return res.json(payload);
		}
		res.json(complaint);
	} catch (err) {
		logSafeError("Get complaint failed", err);
		res.status(500).json({ message: "Server error" });
	}
});

// POST /api/complaints - create (user)
router.post("/", protect, async (req, res) => {
	try {
		const { title, description, category, location, latitude, longitude, photos } = req.body;
		if (!title || !description) return res.status(400).json({ message: "Title and description required" });

		const complaint = await Complaint.create({
			title: String(title).trim(),
			description: String(description).trim(),
			category: category ? String(category).trim() : "general",
			location: location ? String(location).trim() : undefined,
			...(latitude !== undefined &&
				longitude !== undefined &&
				latitude !== "" &&
				longitude !== "" &&
				!Number.isNaN(parseFloat(latitude)) &&
				!Number.isNaN(parseFloat(longitude)) && {
					latitude: parseFloat(latitude),
					longitude: parseFloat(longitude)
				}),
			photos: sanitizePhotos(photos),
			user: req.user._id,
			statusHistory: [{ status: "open", changedBy: req.user._id }]
		});
		res.status(201).json(complaint);
	} catch (err) {
		logSafeError("Error creating complaint", err);
		const message = validationMessage(err);
		if (message) return res.status(400).json({ message });
		res.status(500).json({ message: "Server error" });
	}
});

// PUT /api/complaints/:id - update (owner or admin)
router.put("/:id", protect, async (req, res) => {
	try {
		if (!isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: "Invalid complaint id" });
		}
		const complaint = await Complaint.findById(req.params.id);
		if (!complaint) return res.status(404).json({ message: "Complaint not found" });
		if (!canAccessComplaint(complaint, req.user)) {
			return res.status(403).json({ message: "Forbidden" });
		}

		if (typeof req.body.status !== "undefined" && req.user.role !== "admin") {
			return res.status(403).json({ message: "Only administrators can update complaint status" });
		}

		for (const field of ALLOWED_OWNER_FIELDS) {
			if (typeof req.body[field] === "undefined") continue;
			if (field === "latitude" || field === "longitude") {
				const parsed = parseFloat(req.body[field]);
				if (!Number.isNaN(parsed)) complaint[field] = parsed;
			} else if (field === "photos") {
				complaint.photos = sanitizePhotos(req.body.photos);
			} else {
				complaint[field] = req.body[field];
			}
		}

		if (req.user.role === "admin" && typeof req.body.status !== "undefined") {
			if (!ALLOWED_STATUS.has(req.body.status)) {
				return res.status(400).json({ message: "Invalid status" });
			}
			if (req.body.status !== complaint.status) {
				complaint.status = req.body.status;
				complaint.statusHistory.push({ status: complaint.status, changedBy: req.user._id });
			}
		}

		await complaint.save();
		res.json(complaint);
	} catch (err) {
		logSafeError("Update complaint failed", err);
		const message = validationMessage(err);
		if (message) return res.status(400).json({ message });
		res.status(500).json({ message: "Server error" });
	}
});

// DELETE /api/complaints/:id - delete (owner or admin)
router.delete("/:id", protect, async (req, res) => {
	try {
		if (!isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: "Invalid complaint id" });
		}
		const complaint = await Complaint.findById(req.params.id);
		if (!complaint) return res.status(404).json({ message: "Complaint not found" });
		if (!canAccessComplaint(complaint, req.user)) {
			return res.status(403).json({ message: "Forbidden" });
		}
		await complaint.deleteOne();
		res.json({ message: "Complaint deleted" });
	} catch (err) {
		logSafeError("Delete complaint failed", err);
		res.status(500).json({ message: "Server error" });
	}
});

// Admin-only: update status quickly
router.patch("/:id/status", protect, requireAdmin, async (req, res) => {
	try {
		if (!isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: "Invalid complaint id" });
		}
		const complaint = await Complaint.findById(req.params.id);
		if (!complaint) return res.status(404).json({ message: "Complaint not found" });
		if (!req.body.status || !ALLOWED_STATUS.has(req.body.status)) {
			return res.status(400).json({ message: "Invalid status" });
		}
		if (req.body.status !== complaint.status) {
			complaint.status = req.body.status;
			complaint.statusHistory.push({ status: complaint.status, changedBy: req.user._id });
			await complaint.save();
		}
		res.json(complaint);
	} catch (err) {
		logSafeError("Update status failed", err);
		res.status(500).json({ message: "Server error" });
	}
});

// POST /api/complaints/:id/comments - add a comment / admin note
router.post("/:id/comments", protect, async (req, res) => {
	try {
		if (!isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: "Invalid complaint id" });
		}
		const complaint = await Complaint.findById(req.params.id);
		if (!complaint) return res.status(404).json({ message: "Complaint not found" });
		if (!canAccessComplaint(complaint, req.user)) {
			return res.status(403).json({ message: "Forbidden" });
		}
		if (!req.body.text) return res.status(400).json({ message: "Text required" });
		complaint.comments.push({ user: req.user._id, text: String(req.body.text).trim() });
		await complaint.save();
		res.status(201).json(complaint);
	} catch (err) {
		logSafeError("Add comment failed", err);
		res.status(500).json({ message: "Server error" });
	}
});

export default router;
