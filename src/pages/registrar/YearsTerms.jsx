import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function YearsTerms(){
  const [years, setYears] = useState([]);
  const [name, setName] = useState("");

  const load = async () => {
    const { data } = await api.get("/api/core/years/");
    setYears(data);
  };
  useEffect(()=>{ load(); },[]);

  const createYear = async () => {
    if(!name) return;
    await api.post("/api/core/years/", { name });
    setName("");
    load();
  };

  const seedTerms = async (id) => {
    await api.post(`/api/core/years/${id}/seed_terms/`);
    alert("Terms 1..3 created (if missing).");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Academic Years</h2>
      <div className="flex gap-2">
        <input className="border p-2 rounded" placeholder="2025/2026" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={createYear} className="px-3 py-2 rounded bg-black text-white">Add Year</button>
      </div>
      <table className="w-full text-sm border">
        <thead><tr className="bg-gray-50">
          <th className="p-2 text-left">Name</th><th className="p-2">Terms</th><th className="p-2">Actions</th>
        </tr></thead>
        <tbody>
          {years.map(y=>(
            <tr key={y.id} className="border-t">
              <td className="p-2">{y.name}</td>
              <td className="p-2 text-center">1, 2, 3</td>
              <td className="p-2 text-center">
                <button onClick={()=>seedTerms(y.id)} className="px-2 py-1 rounded border">Seed 1..3</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
