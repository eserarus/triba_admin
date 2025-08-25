import { useEffect } from "react";
import { useAuth } from "../store/auth";
import { useNavigate } from "react-router-dom";

export default function RequireAbility({ ability, children }) {
  const hasAbility = useAuth((s) => s.hasAbility);
  const token = useAuth((s) => s.token);
  const navigate = useNavigate();

  useEffect(() => {
    // If no token, redirect to login
    if (!token) {
      navigate("/login");
      return;
    }

    // If user doesn't have the required ability, redirect to dashboard
    if (ability && !hasAbility(ability)) {
      navigate("/dashboard");
      return;
    }
  }, [token, ability, hasAbility, navigate]);

  // Only render children if user has token and required ability
  if (!token || (ability && !hasAbility(ability))) {
    return null;
  }

  return children;
}
