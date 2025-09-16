// src/components/Protected.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getMe } from "../features/auth/authSlice";

function Loading() { return <div className="p-6">Loading…</div>; }

export default function Protected({ children, roles = [] }) {
  const dispatch = useDispatch();
  const { access, user, userStatus } = useSelector((s) => s.auth);

  if (!access) return <Navigate to="/" replace />;

  useEffect(() => {
    if (userStatus === "idle") dispatch(getMe());
  }, [dispatch, userStatus]);

  if (userStatus === "idle" || userStatus === "loading") return <Loading />;

  // si /me a échoué malgré le refresh → retour login
  if (userStatus === "failed") return <Navigate to="/" replace />;

  if (roles.length && (!user || !roles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
