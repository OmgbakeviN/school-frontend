import { Outlet, NavLink } from "react-router-dom";

export default function RegistrarHome(){
  const link = "px-3 py-2 rounded hover:bg-gray-100";
  const active = ({isActive}) => (isActive ? link+" bg-gray-200 font-semibold" : link);
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="border-r p-4 space-y-3">
        <h1 className="text-lg font-semibold">Registrar</h1>
        <nav className="flex flex-col gap-1">
          <NavLink to="years" className={active}>Years & Terms</NavLink>
          <NavLink to="subjects" className={active}>Subjects</NavLink>
          <NavLink to="classes" className={active}>Classes & Coefs</NavLink>
          <NavLink to="students" className={active}>Students</NavLink>
          <NavLink to="enrollments" className={active}>Enrollments</NavLink>
        </nav>
      </aside>
      <main className="p-6"><Outlet/></main>
    </div>
  );
}
