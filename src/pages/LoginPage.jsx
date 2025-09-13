import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import { Navigate } from "react-router-dom";

export default function LoginPage() {
  const dispatch = useDispatch();
  const { access, status, error } = useSelector(s => s.auth);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  if (access) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <input className="border w-full p-2 rounded" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="border w-full p-2 rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full p-2 rounded bg-black text-white" onClick={()=>dispatch(login({username,password}))} disabled={status==="loading"}>
          {status==="loading" ? "..." : "Login"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}
