import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("cc_theme") || "civiclight");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("cc_theme", theme);
  }, [theme]);

  return (
    <header className="sticky top-0 z-50 shadow-md border-b border-blue-300 bg-gradient-to-r from-sky-500 via-sky-700 to-sky-500">
      <div className="navbar container mx-auto px-4 text-white">
        {/* Logo */}
        <div className="navbar-start flex items-center gap-2">
          <Link to="/" className="btn btn-ghost normal-case text-xl text-white hover:text-yellow-100 flex items-center gap-2">
            <img
              src="/images/Logo.png" 
              alt="CivicConnect Logo"
              className="w-14 h-14 object-contain"
            />
            CivicConnect
          </Link>
        </div>

        {/* Center Menu */}
        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal px-1 gap-2 font-medium">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "bg-white/20 rounded-lg px-3 py-2 font-semibold"
                    : "hover:bg-white/10 rounded-lg px-3 py-2"
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/features"
                className={({ isActive }) =>
                  isActive
                    ? "bg-white/20 rounded-lg px-3 py-2 font-semibold"
                    : "hover:bg-white/10 rounded-lg px-3 py-2"
                }
              >
                Features
              </NavLink>
            </li>
            {isAuthenticated && (
              <>
                <li>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      isActive
                        ? "bg-white/20 rounded-lg px-3 py-2 font-semibold"
                        : "hover:bg-white/10 rounded-lg px-3 py-2"
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
                {user?.role !== "admin" && (
                  <>
                    <li>
                      <NavLink
                        to="/complaints"
                        className={({ isActive }) =>
                          isActive
                            ? "bg-white/20 rounded-lg px-3 py-2 font-semibold"
                            : "hover:bg-white/10 rounded-lg px-3 py-2"
                        }
                      >
                        My Complaints
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/complaints/new"
                        className={({ isActive }) =>
                          isActive
                            ? "bg-white/20 rounded-lg px-3 py-2 font-semibold"
                            : "hover:bg-white/10 rounded-lg px-3 py-2"
                        }
                      >
                        New Complaint
                      </NavLink>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </div>

        {/* Right Section */}
        <div className="navbar-end gap-2 flex items-center">
          {/* Theme Toggle */}
          <button
            className="btn btn-sm btn-ghost text-white border-white/40 hover:border-white/70"
            onClick={() => setTheme(theme === "civicdark" ? "civiclight" : "civicdark")}
          >
            {theme === "civicdark" ? "🌞" : "🌙"}
          </button>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline text-sm">{user?.name}</span>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn btn-sm btn-primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
