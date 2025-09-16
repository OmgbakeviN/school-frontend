// src/pages/teacher/MyAssignments.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Link } from "react-router-dom";

export default function MyAssignments(){
  const [list, setList] = useState([]);
  useEffect(()=>{ api.get("/api/portal/assignments/my/").then(r=>setList(r.data)); },[]);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My assignments</h2>
      <table className="w-full text-sm border">
        <thead><tr className="bg-gray-50">
          <th className="p-2 text-left">Class</th>
          <th className="p-2 text-left">Subject</th>
          <th className="p-2 text-center">Can edit</th>
          <th className="p-2 text-center">Action</th>
        </tr></thead>
        <tbody>
          {list.map(a=>(
            <tr key={a.id} className="border-t">
              <td className="p-2">{a.classroom_name}</td>
              <td className="p-2">{a.subject_code} — {a.subject_name}</td>
              <td className="p-2 text-center">{a.can_edit ? "Yes" : "No"}</td>
              <td className="p-2 text-center">
                <Link className="px-2 py-1 rounded border"
                      to={`/teacher/grade?class_subject=${a.class_subject_id}&classroom=${a.classroom_id}`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
          {!list.length && <tr><td className="p-3 text-sm text-gray-500" colSpan={4}>No assignments yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
