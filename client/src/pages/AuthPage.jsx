import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage() {
	const [isRegister, setIsRegister] = useState(false);
	const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
	const { login, register } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || "/Home";

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (isRegister) await register(form.name, form.email, form.password, form.role);
			else await login(form.email, form.password);
			navigate(from, { replace: true });
		} catch (err) {
			alert("Authentication failed");
		}
	};

	return (
		<section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white-100 via-white to-white-100">
			<div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
				<h2 className="text-3xl font-bold text-center mb-6 text-gray-800">{isRegister ? "Create Account" : "Welcome Back"}</h2>

				<div className="tabs tabs-boxed w-full mb-6 flex justify-between bg-gray-100 rounded-xl overflow-hidden">
					<button
						className={`tab flex-1 ${!isRegister ? "tab-active bg-white text-indigo-600" : "text-gray-500 hover:bg-gray-200"}`}
						onClick={() => setIsRegister(false)}
					>
						Login
					</button>
					<button
						className={`tab flex-1 ${isRegister ? "tab-active bg-white text-indigo-600" : "text-gray-500 hover:bg-gray-200"}`}
						onClick={() => setIsRegister(true)}
					>
						Register
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{isRegister && (
						<input
							className="input input-bordered w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
							placeholder="Name"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							required
						/>
					)}
					<input
						className="input input-bordered w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
						type="email"
						placeholder="Email"
						value={form.email}
						onChange={(e) => setForm({ ...form, email: e.target.value })}
						required
					/>
					<input
						className="input input-bordered w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
						type="password"
						placeholder="Password"
						value={form.password}
						onChange={(e) => setForm({ ...form, password: e.target.value })}
						required
					/>
					{isRegister && (
						<select
							className="select select-bordered w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
							value={form.role}
							onChange={(e) => setForm({ ...form, role: e.target.value })}
						>
							<option value="user">User</option>
							<option value="admin">Admin</option>
						</select>
					)}
					<button className="btn w-full bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300">
						{isRegister ? "Create Account" : "Login"}
					</button>
				</form>

				<p className="text-center text-gray-500 mt-4 text-sm">
					{isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
					<span
						className="text-indigo-600 cursor-pointer hover:underline"
						onClick={() => setIsRegister(!isRegister)}
					>
						{isRegister ? "Login" : "Register"}
					</span>
				</p>
			</div>
		</section>
	);
}
