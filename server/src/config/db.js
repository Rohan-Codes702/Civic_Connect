import mongoose from "mongoose";

export const connectDB = async (mongoUri) => {
	try {
		await mongoose.connect(mongoUri, {
			// Mongoose 7+ uses new URL parser and unified topology by default
		});
		console.log("MongoDB connected");
	} catch (error) {
		console.error("MongoDB connection error:", error.message);
		process.exit(1);
	}
};


