import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		text: { type: String, required: true }
	},
	{ timestamps: true }
);

const statusHistorySchema = new mongoose.Schema(
	{
		status: { type: String, enum: ["open", "in_progress", "resolved"], required: true },
		changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
	},
	{ timestamps: { createdAt: true, updatedAt: false } }
);

const complaintSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		description: { type: String, required: true },
		status: { type: String, enum: ["open", "in_progress", "resolved"], default: "open" },
		category: { type: String, default: "general" },
		location: { type: String },
		latitude: { type: Number },
		longitude: { type: Number },
		photos: [{ url: { type: String } }],
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		comments: [commentSchema],
		statusHistory: [statusHistorySchema]
	},
	{ timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;
