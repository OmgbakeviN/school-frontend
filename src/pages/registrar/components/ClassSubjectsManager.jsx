import { useEffect, useState } from "react";
import api from "../../../lib/api";

export default function ClassSubjectsManager({ classroom }){
  const [available, setAvailable] = useState([]);
  const [list, setList] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [coef, setCoef] = useState("1.00");
  const [isCore, setIsCore] = useState(false);
  const load = async () => {
    const [allSubjects, classSubjects] = await Promise.all([
      api.get("/api/subjects/subjects/"),
      api.get("/api/subjects/class-subjects/by-class/", { params: { classroom: classroom.id } })
    ]);
    setAvailable(allSubjects.data);
    setList(classSubjects.data);
  };
  useEffect(()=>{ load(); /* eslint-disable-next-line */},[classroom.id]);

  const addOne = async () => {
    if(!subjectId) return;
    await api.post("/api/subjects/class-subjects/", {
      classroom: classroom.id,
      subject: Number(subjectId),
      coefficient: Number(coef),
      is_core: isCore
    });
    setSubjectId(""); setCoef("1.00"); setIsCore(false);
    load();
  };

  const updateCoef = async (id, newCoef) => {
    await api.patch(`/api/subjects/class-subjects/${id}/`, { coefficient: Number(newCoef) });
    load();
  };
  const toggleCore = async (id, current) => {
    await api.patch(`/api/subjects/class-subjects/${id}/`, { is_core: !current });
    load();
  };
  const removeOne = async (id) => {
    await api.delete(`/api/subjects/class-subjects/${id}/`);
    load();
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <select className="border p-2 rounded" value={subjectId} onChange={e=>setSubjectId(e.target.value)}>
          <option value="">Select subject...</option>
          {available.map(s=><option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
        </select>
        <input className="border p-2 rounded w-28" placeholder="coef" value={coef} onChange={e=>setCoef(e.target.value)} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isCore} onChange={e=>setIsCore(e.target.checked)} />
          Core
        </label>
        <button className="px-3 py-2 rounded bg-black text-white" onClick={addOne}>Add</button>
      </div>

      <table className="w-full text-sm border">
        <thead><tr className="bg-gray-50">
          <th className="p-2 text-left">Subject</th>
          <th className="p-2">Coef</th>
          <th className="p-2">Core</th>
          <th className="p-2">Actions</th>
        </tr></thead>
        <tbody>
          {list.map(cs=>(
            <tr key={cs.id} className="border-t">
              <td className="p-2">{cs.subject_code} — {cs.subject_name}</td>
              <td className="p-2 text-center">
                <input className="border p-1 rounded w-20 text-center"
                  defaultValue={cs.coefficient}
                  onBlur={e=>updateCoef(cs.id, e.target.value)} />
              </td>
              <td className="p-2 text-center">
                <button className="px-2 py-1 rounded border" onClick={()=>toggleCore(cs.id, cs.is_core)}>
                  {cs.is_core ? "Yes" : "No"}
                </button>
              </td>
              <td className="p-2 text-center">
                <button className="px-2 py-1 rounded border" onClick={()=>removeOne(cs.id)}>Remove</button>
              </td>
            </tr>
          ))}
          {!list.length && (
            <tr><td className="p-3 text-sm text-gray-500" colSpan={4}>
              No subjects yet. Use the form above to add one.
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
