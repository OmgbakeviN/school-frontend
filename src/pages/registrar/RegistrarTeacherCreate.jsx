import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import { Link, useNavigate } from "react-router-dom";

export default function RegistrarTeacherCreate() {
  const nav = useNavigate();

  // Step 1 — user info
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [staffCode, setStaffCode] = useState("");

  // Step 2 — assignments
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classroomId, setClassroomId] = useState("");
  const [classSubjects, setClassSubjects] = useState([]);
  const [selected, setSelected] = useState(new Map()); // key: class_subject_id -> can_edit(bool)

  const loadYears = async () => {
    const { data } = await api.get("/api/core/years/");
    setYears(data || []);
  };
  const loadClasses = async (yearId) => {
    const { data } = await api.get("/api/core/classes/", { params: { year: yearId } });
    setClasses(data || []);
  };
  const loadClassSubjects = async (cid) => {
    const { data } = await api.get("/api/subjects/class-subjects/", { params: { classroom: cid } });
    setClassSubjects(data || []);
  };

  useEffect(() => { loadYears(); }, []);
  const [yearId, setYearId] = useState("");

  useEffect(() => {
    if (!yearId) { setClasses([]); setClassroomId(""); setClassSubjects([]); return; }
    loadClasses(yearId);
  }, [yearId]);

  useEffect(() => {
    if (!classroomId) { setClassSubjects([]); return; }
    loadClassSubjects(classroomId);
  }, [classroomId]);

  const toggleSelect = (csId) => {
    const next = new Map(selected);
    if (next.has(csId)) next.delete(csId); else next.set(csId, true);
    setSelected(next);
  };
  const toggleCanEdit = (csId, val) => {
    const next = new Map(selected);
    if (!next.has(csId)) next.set(csId, Boolean(val));
    else next.set(csId, Boolean(val));
    setSelected(next);
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!username || !password) { alert("Username et mot de passe requis."); return; }
    const assignments = Array.from(selected.entries()).map(([csId, can]) => ({
      class_subject: Number(csId), can_edit: Boolean(can)
    }));
    try {
      const payload = {
        user: { username, password, first_name: firstName, last_name: lastName, email },
        staff_code: staffCode,
        assignments
      };
      const { data } = await api.post("/api/api/portal/teachers/full-create/", payload);
      alert("Teacher created.");
      nav("/registrar/teachers"); // à condition d'avoir la liste/CRUD des teachers
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || "Create failed.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Create Teacher</h2>
        <Link className="px-3 py-2 rounded border" to="/registrar/teachers">Back to list</Link>
      </div>

      {/* Step 1 — User */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Username *</label>
            <input className="border rounded p-2 w-full" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Password *</label>
            <input type="password" className="border rounded p-2 w-full" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">First name</label>
            <input className="border rounded p-2 w-full" value={firstName} onChange={e=>setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Last name</label>
            <input className="border rounded p-2 w-full" value={lastName} onChange={e=>setLastName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="border rounded p-2 w-full" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Staff code</label>
            <input className="border rounded p-2 w-full" value={staffCode} onChange={e=>setStaffCode(e.target.value)} />
          </div>
        </div>

        {/* Step 2 — Assignments */}
        <div className="space-y-3">
          <h3 className="font-semibold">Assignments</h3>
          <div className="flex flex-wrap gap-2">
            <select className="border p-2 rounded" value={yearId} onChange={e=>setYearId(e.target.value || "")}>
              <option value="">— Year —</option>
              {years.map(y=> <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
            <select className="border p-2 rounded" value={classroomId} onChange={e=>setClassroomId(e.target.value || "")}>
              <option value="">— Class —</option>
              {classes.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="button" className="px-2 py-1 rounded border" onClick={()=>classroomId && loadClassSubjects(classroomId)}>Load subjects</button>
          </div>

          <div className="border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">Subject</th>
                  <th className="p-2 text-left">Code</th>
                  <th className="p-2 text-center">Select</th>
                  <th className="p-2 text-center">Can edit</th>
                </tr>
              </thead>
              <tbody>
                {classSubjects.map(cs=>{
                  const csId = cs.id ?? cs.class_subject_id ?? cs.classSubjectId;
                  const subjName = cs.subject?.name ?? cs.subject_name ?? "";
                  const subjCode = cs.subject?.code ?? cs.subject_code ?? "";
                  const isSel = selected.has(csId);
                  return (
                    <tr key={csId} className="border-t">
                      <td className="p-2">{subjName}</td>
                      <td className="p-2">{subjCode}</td>
                      <td className="p-2 text-center">
                        <input type="checkbox" checked={isSel} onChange={()=>toggleSelect(csId)} />
                      </td>
                      <td className="p-2 text-center">
                        <input type="checkbox" disabled={!isSel}
                               checked={Boolean(selected.get(csId))}
                               onChange={(e)=>toggleCanEdit(csId, e.target.checked)} />
                      </td>
                    </tr>
                  );
                })}
                {!classSubjects.length && (
                  <tr><td className="p-3 text-sm text-gray-500" colSpan={4}>Select a class and click “Load subjects”.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Link className="px-3 py-2 rounded border" to="/registrar/teachers">Cancel</Link>
          <button type="submit" className="px-3 py-2 rounded bg-black text-white">Create teacher</button>
        </div>
      </form>
    </div>
  );
}
