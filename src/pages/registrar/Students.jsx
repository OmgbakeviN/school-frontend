import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function Students(){
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({matricule:"", last_name:"", first_name:"", sex:"M"});

  const load = async () => {
    const { data } = await api.get("/api/students/", { params: q ? { search:q } : {} });
    setList(data);
  };
  useEffect(()=>{ load(); },[]);

  const createOne = async () => {
    if(!form.matricule || !form.last_name || !form.first_name) return;
    await api.post("/api/students/", form);
    setForm({matricule:"", last_name:"", first_name:"", sex:"M"});
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Students</h2>
      <div className="flex gap-2 flex-wrap">
        <input className="border p-2 rounded" placeholder="Search name/matricule..." value={q} onChange={e=>setQ(e.target.value)} />
        <button className="px-3 py-2 rounded border" onClick={load}>Search</button>
      </div>
      <div className="flex gap-2 flex-wrap items-end">
        <input className="border p-2 rounded" placeholder="Matricule" value={form.matricule} onChange={e=>setForm({...form, matricule:e.target.value})}/>
        <input className="border p-2 rounded" placeholder="Last name" value={form.last_name} onChange={e=>setForm({...form, last_name:e.target.value})}/>
        <input className="border p-2 rounded" placeholder="First name" value={form.first_name} onChange={e=>setForm({...form, first_name:e.target.value})}/>
        <select className="border p-2 rounded" value={form.sex} onChange={e=>setForm({...form, sex:e.target.value})}>
          <option value="M">M</option><option value="F">F</option>
        </select>
        <button className="px-3 py-2 rounded bg-black text-white" onClick={createOne}>Add</button>
      </div>

      <table className="w-full text-sm border">
        <thead><tr className="bg-gray-50"><th className="p-2">Matricule</th><th>Name</th><th>Sex</th></tr></thead>
        <tbody>
          {list.map(s=>(
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.matricule}</td>
              <td className="p-2">{s.last_name} {s.first_name}</td>
              <td className="p-2">{s.sex}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
