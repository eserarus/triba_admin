import { useAuth } from "./store/auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Categories from "./pages/Categories";
import Attributes from "./pages/Attributes";
import CategoryAttributes from "./pages/CategoryAttributes";
import RequireAbility from "./components/RequireAbility";
import RequireAuth from "./components/RequireAuth";

// Admin Pages
import { AdminCategoriesPage, CategoryFormPage } from "./components/categories";

function HomeRedirect() {
  const token = useAuth((s) => s.token);

  if (!token) return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Main listing pages */}
        <Route
          path="/admin/users"
          element={
            <RequireAbility ability="admin">
              <Users />
            </RequireAbility>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <RequireAbility ability="admin">
              <Categories />
            </RequireAbility>
          }
        />
        <Route
          path="/admin/attributes"
          element={
            <RequireAbility ability="admin">
              <Attributes />
            </RequireAbility>
          }
        />
        <Route
          path="/admin/category-attributes"
          element={
            <RequireAbility ability="admin">
              <CategoryAttributes />
            </RequireAbility>
          }
        />

        {/* Admin category management routes */}
        <Route
          path="/admin/categories-admin"
          element={
            <RequireAbility ability="admin">
              <AdminCategoriesPage />
            </RequireAbility>
          }
        />
        <Route
          path="/admin/categories/new"
          element={
            <RequireAbility ability="admin">
              <CategoryFormPage />
            </RequireAbility>
          }
        />
        <Route
          path="/admin/categories/:id/edit"
          element={
            <RequireAbility ability="admin">
              <CategoryFormPage />
            </RequireAbility>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
