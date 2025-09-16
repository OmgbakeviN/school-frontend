// src/pages/principal/PrincipalHome.jsx
import { Outlet, NavLink } from "react-router-dom";

export default function PrincipalHome(){
  const cls = ({isActive}) => `px-3 py-2 rounded ${isActive?'bg-gray-200 font-semibold':'hover:bg-gray-100'}`;
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="border-r p-4 space-y-3">
        <h1 className="text-lg font-semibold">Principal</h1>
        <nav className="flex flex-col gap-1">
          <NavLink to="class-stats" className={cls}>Class stats</NavLink>
        </nav>
      </aside>
      <main className="p-6"><Outlet/></main>
    </div>
  );
}
