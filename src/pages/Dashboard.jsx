import { useEffect, useState } from "react";
import api from "../lib/api";
import { useDispatch, useSelector } from "react-redux";
import { logout, setUser } from "../features/auth/authSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector(s=>s.auth);
  const [health, setHealth] = useState(null);

  useEffect(()=> {
    api.get("/api/me/").then(r=>dispatch(setUser(r.data))).catch(()=>dispatch(logout()));
    api.get("/api/health/").then(r=>setHealth(r.data.status)).catch(()=>setHealth("down"));
  }, [dispatch]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button className="px-3 py-1 rounded border" onClick={()=>dispatch(logout())}>Logout</button>
      </div>
      <div className="border rounded p-4">
        <p>User: {user ? `${user.username} (${user.role})` : "loading"}</p>
        <p>API Health: {health || "..."}</p>
      </div>
    </div>
  );
}
