import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function RequireAuth({ children }) {
  const token = useAuth((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
