import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function AdminLayout({ children }) {
  const logout = useAuth((s) => s.logout);
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="font-semibold">
            Triba Admin
          </Link>
          <nav className="space-x-4 text-sm">
            <NavLink to="/admin/users" className="underline">
              Users
            </NavLink>
            <NavLink to="/admin/categories" className="underline">
              Categories
            </NavLink>
            <button onClick={logout} className="underline">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
