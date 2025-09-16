import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function SubjectsMaster(){
  const [list, setList] = useState([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const load = async () => {
    const { data } = await api.get("/api/subjects/subjects/");
    setList(data);
  };
  useEffect(()=>{ load(); },[]);

  const createSubject = async () => {
    if(!code || !name) return;
    await api.post("/api/subjects/subjects/", { code, name });
    setCode(""); setName("");
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Subjects</h2>
      <div className="flex flex-wrap gap-2">
        <input className="border p-2 rounded" placeholder="MATH" value={code} onChange={e=>setCode(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Mathematics" value={name} onChange={e=>setName(e.target.value)} />
        <button className="px-3 py-2 rounded bg-black text-white" onClick={createSubject}>Add</button>
      </div>
      <table className="w-full text-sm border">
        <thead><tr className="bg-gray-50">
          <th className="p-2 text-left">Code</th><th className="p-2 text-left">Name</th>
        </tr></thead>
        <tbody>
          {list.map(s=>(
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.code}</td>
              <td className="p-2">{s.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
