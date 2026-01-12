import express from "express";
import Complaint from "../models/Complaint.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/complaints - Admin gets all, user gets own, with filters & pagination
router.get("/", protect, async (req, res) => {
	try {
		const isAdmin = req.user.role === "admin";
		const {
			page = 1,
			limit = 10,
			sort = "-createdAt",
			status,
			category,
			q
		} = req.query;

		const match = {};
		if (!isAdmin) match.user = req.user._id;
		if (status) match.status = status;
		if (category) match.category = category;
		if (q) match.$or = [
			{ title: { $regex: q, $options: "i" } },
			{ description: { $regex: q, $options: "i" } }
		];

		const skip = (Number(page) - 1) * Number(limit);

		const [items, total] = await Promise.all([
			Complaint.find(match)
				.sort(sort)
				.skip(skip)
				.limit(Number(limit))
				.populate(isAdmin ? { path: "user", select: "name email role" } : null),
			Complaint.countDocuments(match)
		]);

		res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
	} catch (err) {
		res.status(500).json({ message: "Server error" });
	}
});

// POST /api/complaints - create (user)
router.post("/", protect, async (req, res) => {
	try {
		const { title, description, category, location, latitude, longitude, photos } = req.body;
		if (!title || !description) return res.status(400).json({ message: "Title and description required" });
		const complaint = await Complaint.create({
			title,
			description,
			category,
			location,
			...(latitude && longitude && { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }),
			...(photos && photos.length > 0 && { photos }),
			user: req.user._id,
			statusHistory: [{ status: "open", changedBy: req.user._id }]
		});
		res.status(201).json(complaint);
	} catch (err) {
		console.error("Error creating complaint:", err);
		res.status(500).json({ message: "Server error" });
	}
});

// PUT /api/complaints/:id - update (owner or admin)
router.put("/:id", protect, async (req, res) => {
	try {
		const complaint = await Complaint.findById(req.params.id);
		if (!complaint) return res.status(404).json({ message: "Complaint not found" });
		const isOwner = complaint.user.toString() === req.user._id.toString();
		if (!isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
		const fields = ["title", "description", "category", "location", "latitude", "longitude", "photos", "status"];
		let statusChanged = false;
		for (const field of fields) {
			if (typeof req.body[field] !== "undefined") {
				if (field === "status" && req.body.status !== complaint.status) statusChanged = true;
				if (field === "latitude" || field === "longitude") {
					complaint[field] = parseFloat(req.body[field]);
				} else {
					complaint[field] = req.body[field];
				}
			}
		}
		if (statusChanged) {
			complaint.statusHistory.push({ status: complaint.status, changedBy: req.user._id });
		}
		await complaint.save();
		res.json(complaint);
	} catch (err) {
		res.status(500).json({ message: "Server error" });
	}
});

// DELETE /api/complaints/:id - delete (owner or admin)
router.delete("/:id", protect, async (req, res) => {
	try {
		const complaint = await Complaint.findById(req.params.id);
		if (!complaint) return res.status(404).json({ message: "Complaint not found" });
		const isOwner = complaint.user.toString() === req.user._id.toString();
		if (!isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
		await complaint.deleteOne();
		res.json({ message: "Complaint deleted" });
	} catch (err) {
		res.status(500).json({ message: "Server error" });
	}
});

// Admin-only: update status quickly
router.patch("/:id/status", protect, requireAdmin, async (req, res) => {
	try {
		const complaint = await Complaint.findById(req.params.id);
		if (!complaint) return res.status(404).json({ message: "Complaint not found" });
		if (req.body.status && req.body.status !== complaint.status) {
			complaint.status = req.body.status;
			complaint.statusHistory.push({ status: complaint.status, changedBy: req.user._id });
			await complaint.save();
		}
		res.json(complaint);
	} catch (err) {
		res.status(500).json({ message: "Server error" });
	}
});

// POST /api/complaints/:id/comments - add a comment
router.post("/:id/comments", protect, async (req, res) => {
	try {
		const complaint = await Complaint.findById(req.params.id);
		if (!complaint) return res.status(404).json({ message: "Complaint not found" });
		const isOwnerOrAdmin = complaint.user.toString() === req.user._id.toString() || req.user.role === "admin";
		if (!isOwnerOrAdmin) return res.status(403).json({ message: "Forbidden" });
		if (!req.body.text) return res.status(400).json({ message: "Text required" });
		complaint.comments.push({ user: req.user._id, text: req.body.text });
		await complaint.save();
		res.status(201).json(complaint);
	} catch (err) {
		res.status(500).json({ message: "Server error" });
	}
});

// GET /api/complaints/stats - admin stats summary
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
		res.status(500).json({ message: "Server error" });
	}
});

export default router;
