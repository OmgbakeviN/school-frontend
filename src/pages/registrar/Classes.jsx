import { useEffect, useState } from "react";
import api from "../../lib/api";
import ClassSubjectsManager from "./components/ClassSubjectsManager";

export default function Classes(){
  const [years, setYears] = useState([]);
  const [levels, setLevels] = useState([]);
  const [streams, setStreams] = useState([]);
  const [classes, setClasses] = useState([]);

  const [form, setForm] = useState({year:null, level:null, stream:null, name:""});
  const [selectedClass, setSelectedClass] = useState(null);

  const loadMeta = async () => {
    const [y, l, s] = await Promise.all([
      api.get("/api/core/years/"),
      api.get("/api/core/levels/"),
      api.get("/api/core/streams/")
    ]);
    setYears(y.data); setLevels(l.data); setStreams(s.data);
  };
  const loadClasses = async () => {
    const { data } = await api.get("/api/core/classes/", { params: { year: form.year || undefined }});
    setClasses(data);
  };

  useEffect(()=>{ loadMeta(); },[]);
  useEffect(()=>{ if(form.year) loadClasses(); },[form.year]);

  const createClass = async () => {
    if(!form.year || !form.level || !form.name) return;
    await api.post("/api/core/classes/", form);
    setForm({...form, name:""});
    loadClasses();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Classes & Coefficients</h2>

      <div className="grid gap-3 md:grid-cols-4">
        <select className="border p-2 rounded" value={form.year||""} onChange={e=>setForm({...form, year:Number(e.target.value)||null})}>
          <option value="">Year...</option>
          {years.map(y=><option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <select className="border p-2 rounded" value={form.level||""} onChange={e=>setForm({...form, level:Number(e.target.value)||null})}>
          <option value="">Level...</option>
          {levels.map(l=><option key={l.id} value={l.id}>{l.code} - {l.name}</option>)}
        </select>
        <select className="border p-2 rounded" value={form.stream||""} onChange={e=>setForm({...form, stream:e.target.value?Number(e.target.value):null})}>
          <option value="">Stream (optional)</option>
          {streams.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input className="border p-2 rounded flex-1" placeholder="Form 5A" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
          <button className="px-3 py-2 rounded bg-black text-white" onClick={createClass}>Create</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 border rounded">
          <div className="p-2 font-semibold bg-gray-50">Classes</div>
          <ul className="max-h-[420px] overflow-auto">
            {classes.map(c=>(
              <li key={c.id} className={`p-2 border-t cursor-pointer ${selectedClass?.id===c.id?'bg-gray-100':''}`}
                  onClick={()=>setSelectedClass(c)}>
                {c.name}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 border rounded">
          <div className="p-2 font-semibold bg-gray-50">Subjects & Coefficients</div>
          {selectedClass ? (
            <ClassSubjectsManager classroom={selectedClass}/>
          ) : (
            <div className="p-4 text-sm text-gray-500">Select a class to manage its subjects.</div>
          )}
        </div>
      </div>
    </div>
  );
}
