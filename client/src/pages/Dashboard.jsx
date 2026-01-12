import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AdminComplaints from "./AdminComplaints.jsx";
import MyComplaints from "./MyComplaints.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <section className="bg-gradient-to-b from-white-800 via-white to-purple-50 py-16 px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-12">

        {/* Welcome Card */}    
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-1xl border border-white/30 p-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Hello, {user?.name}!</h1>
          <p className="text-gray-600 text-lg">Welcome back to your dashboard.</p>
        </div>

        {/* Admin Section */}
        {user?.role === "admin" ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700 text-center">Admin Complaints Overview</h2>
            <div className="grid gap-6 md:grid-cols-1">
              <div className="bg-white shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-shadow duration-300">
                <AdminComplaints />
              </div>
            </div>
          </div>
        ) : (
          /* User Section */
          <div className="flex flex-col gap-8">
            
            {/* User Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/complaints"
                className="flex-1 sm:flex-none py-4 px-8 rounded-2xl bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-lg hover:scale-105 transition-transform duration-300 text-center font-medium"
              >
                My Complaints
              </Link>
              <Link
                to="/complaints/new"
                className="flex-1 sm:flex-none py-4 px-8 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 transition-transform duration-300 text-center font-medium"
              >
                New Complaint
              </Link>
            </div>

            {/* User Complaints List */}
            <div className="bg-white shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-shadow duration-300">
              <MyComplaints />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
