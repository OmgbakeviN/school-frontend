// src/pages/teacher/TeacherHome.jsx
import { Outlet, NavLink } from "react-router-dom";
export default function TeacherHome(){
  const cls = v => `px-3 py-2 rounded ${v.isActive?'bg-gray-200 font-semibold':'hover:bg-gray-100'}`;
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="border-r p-4 space-y-3">
        <h1 className="text-lg font-semibold">Teacher</h1>
        <nav className="flex flex-col gap-1">
          <NavLink to="assignments" className={cls}>My assignments</NavLink>
        </nav>
      </aside>
      <main className="p-6"><Outlet/></main>
    </div>
  );
}
