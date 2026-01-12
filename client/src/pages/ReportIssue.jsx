import { Link } from "react-router-dom";

export default function ReportIssue() {
	return (
		<section className="py-16">
			<div className="rounded-2xl border bg-base-100 p-8 md:p-10">
				<h2 className="text-2xl font-bold mb-2">Report an Issue</h2>
				<p className="text-base-content/70 mb-6">Help your local government respond faster by reporting issues with clear details and photos.</p>
				<div>
					<Link to="/complaints/new" className="btn btn-primary">Start a new complaint</Link>
				</div>
			</div>
		</section>
	);
}



