import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Link } from "react-router-dom";

export default function Enrollments() {
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ year: null, classroom: null, student: null });
  const [list, setList] = useState([]);

  const loadYears = async () => {
    const { data } = await api.get("/api/core/years/");
    setYears(data);
  };
  const loadClasses = async (year) => {
    const { data } = await api.get("/api/core/classes/", { params: { year } });
    setClasses(data);
  };
  const loadStudents = async (q = "") => {
    const { data } = await api.get("/api/students/", { params: q ? { search: q } : {} });
    setStudents(data);
  };
  const loadEnrollments = async () => {
    if (!form.classroom) return setList([]);
    const { data } = await api.get("/api/enrollments/", { params: { classroom: form.classroom } });
    setList(data);
  };

  useEffect(() => { loadYears(); loadStudents(); }, []);
  useEffect(() => { if (form.year) loadClasses(form.year); }, [form.year]);
  useEffect(() => { loadEnrollments(); }, [form.classroom]);

  const enroll = async () => {
    if (!form.student || !form.classroom) return;
    await api.post("/api/enrollments/", { student: Number(form.student), classroom: Number(form.classroom) });
    loadEnrollments();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Enrollments</h2>
      <div className="grid gap-2 md:grid-cols-4">
        <select className="border p-2 rounded" value={form.year || ""} onChange={e => setForm({ ...form, year: Number(e.target.value) || null })}>
          <option value="">Year...</option>
          {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <select className="border p-2 rounded" value={form.classroom || ""} onChange={e => setForm({ ...form, classroom: Number(e.target.value) || null })}>
          <option value="">Classroom...</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="border p-2 rounded" value={form.student || ""} onChange={e => setForm({ ...form, student: Number(e.target.value) || null })}>
          <option value="">Student...</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.matricule} — {s.last_name} {s.first_name}</option>)}
        </select>
        <button className="px-3 py-2 rounded bg-black text-white" onClick={enroll}>Enroll</button>
      </div>

      <div className="border rounded">
        <div className="p-2 bg-gray-50 font-semibold">Class enrollments</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Student</th>
              <th className="p-2 text-left">Matricule</th>
              <th className="p-2 text-left">Class</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(e => (
              <tr key={e.id} className="border-t">
                <td className="p-2">{e.student?.full_name || "—"}</td>
                <td className="p-2">{e.student?.matricule || "—"}</td>
                <td className="p-2">{e.classroom_name} ({e.level})</td>
                <td className="p-2 text-center">
                  <Link
                    to={`/registrar/enrollment-subjects?enrollment=${e.id}&classroom=${e.classroom}`}
                    className="px-2 py-1 rounded border"
                  >
                    Assign Subjects
                  </Link>
                </td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td className="p-3 text-sm text-gray-500" colSpan={4}>No enrollments yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
