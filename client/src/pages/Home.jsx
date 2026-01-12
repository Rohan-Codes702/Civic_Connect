import React from "react";
import Features from "./Features.jsx";
import Dashboard from "./Dashboard.jsx";
import ReportIssue from "./ReportIssue.jsx";
import { useNavigate } from "react-router-dom";

export default function Home() {
	const navigate = useNavigate();

	return (
		<div className="bg-gradient-to-b from-white-100 via-white to-white-100 min-h-screen">
			{/* Hero Section */}
			<section className="px-6 py-20 flex flex-col-reverse md:flex-row items-center max-w-7xl mx-auto gap-12">
				{/* Text Content */}
				<div className="flex-1 max-w-xl">
					<h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-indigo-900 via-blue-800 to-purple-900 text-transparent bg-clip-text leading-tight">
						Bridging Communities with Local Government
					</h1>
					<p className="mb-8 text-gray-700 text-lg">
						Report issues and strengthen civic engagement in your neighborhood effortlessly.
					</p>
					<div className="flex flex-wrap items-center gap-4">
						<button
							onClick={() => navigate("/report")}
							className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition transform hover:-translate-y-1"
						>
							Report an Issue
						</button>
						<button
							onClick={() => navigate("/dashboard")}
							className="underline text-sky-700 hover:text-sky-900 font-medium transition"
						>
							View Analytics
						</button>
					</div>
				</div>

{/* Hero Image */}
<div className="flex-1 flex justify-center">
  <img
    src="/images/image.png" // Place your image in public/images/
    className="w-72 h-96 md:w-80 md:h-[28rem] object-contain"
    alt="Community Reporting Illustration"
  />
</div>


			</section>

			
			<Features />
			<Dashboard />
			<ReportIssue />
		</div>
	);
}
