// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../lib/api";
import { useDispatch, useSelector } from "react-redux";
import { logout, getMe } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, userStatus } = useSelector((s) => s.auth);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    if (userStatus === "idle") dispatch(getMe());
    api.get("/api/health/").then((r) => setHealth(r.data.status)).catch(() => setHealth("down"));
  }, [dispatch, userStatus]);

  const doLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button className="px-3 py-1 rounded border" onClick={doLogout}>Logout</button>
      </div>
      <div className="border rounded p-4">
        <p>User: {user ? `${user.username} (${user.role})` : (userStatus === "failed" ? "not signed in" : "loading…")}</p>
        <p>API Health: {health || "..."}</p>
      </div>
    </div>
  );
}
