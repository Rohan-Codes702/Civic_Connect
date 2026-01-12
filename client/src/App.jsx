import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Features from "./pages/Features.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ComplaintForm from "./pages/ComplaintForm.jsx";
import MyComplaints from "./pages/MyComplaints.jsx";
import AdminComplaints from "./pages/AdminComplaints.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-1 container mx-auto px-4 py-6">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/features" element={<Features />} />
					<Route path="/auth" element={<AuthPage />} />
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/complaints/new"
						element={
							<ProtectedRoute>
								<ComplaintForm />
							</ProtectedRoute>
						}
					/>
					
					<Route
						path="/report"
						element={
							<ProtectedRoute	>
								<ComplaintForm />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/complaints"
						element={
							<ProtectedRoute blockAdmin>
								<MyComplaints />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/complaints"
						element={
							<ProtectedRoute requireAdmin>
								<AdminComplaints />
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</main>
			<Footer />
		</div>
	);
}


