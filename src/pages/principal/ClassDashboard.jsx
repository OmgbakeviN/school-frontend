// src/pages/principal/ClassDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function ClassDashboard(){
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);

  const [yearId, setYearId] = useState(null);
  const [classroomId, setClassroomId] = useState(null);
  const [termId, setTermId] = useState(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ api.get("/api/core/years/").then(r=>setYears(r.data)); },[]);
  useEffect(()=>{
    if(!yearId){ setClasses([]); setTerms([]); setClassroomId(null); setTermId(null); return; }
    Promise.all([
      api.get("/api/core/classes/", { params: { year: yearId }}),
      api.get("/api/core/terms/", { params: { year: yearId }})
    ]).then(([C,T])=>{
      setClasses(C.data); setTerms(T.data.sort((a,b)=>a.index-b.index));
    });
  },[yearId]);

  const loadStats = async () => {
    if(!classroomId || !termId) return;
    setLoading(true);
    try{
      const { data } = await api.get(`/api/analytics/classes/${classroomId}/stats/`, { params: { term: termId, pass_mark: 50 }});
      setData(data);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ loadStats(); /* eslint-disable-next-line */ },[classroomId, termId]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Class statistics</h2>

      <div className="grid gap-3 md:grid-cols-4">
        <select className="border p-2 rounded" value={yearId||""} onChange={e=>setYearId(Number(e.target.value)||null)}>
          <option value="">Year...</option>
          {years.map(y=> <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <select className="border p-2 rounded" value={classroomId||""} onChange={e=>setClassroomId(Number(e.target.value)||null)}>
          <option value="">Classroom...</option>
          {classes.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="border p-2 rounded" value={termId||""} onChange={e=>setTermId(Number(e.target.value)||null)}>
          <option value="">Term...</option>
          {terms.map(t=> <option key={t.id} value={t.id}>Term {t.index}</option>)}
        </select>
        <button className="px-3 py-2 rounded border" onClick={loadStats} disabled={loading}>Refresh</button>
      </div>

      {!data ? (
        <div className="text-sm text-gray-500">{loading ? "Loading…" : "Select year, class and term."}</div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <KPI title="Class average" value={`${data.class_avg}`} />
            <KPI title="Pass rate" value={`${data.pass_rate}%`} />
            <KPI title="Students" value={`${data.count_students}`} />
            <KPI title="Completion" value={`${data.completion_rate}%`} />
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Average by subject">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.per_subject}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject_code" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="avg" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Distribution of averages">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Top 3 */}
          <Card title="Top 3 students">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="p-2 text-left">Student</th>
                <th className="p-2">Matricule</th>
                <th className="p-2 text-right">Average</th>
              </tr></thead>
              <tbody>
                {data.top_students.map((s,i)=>(
                  <tr key={i} className="border-t">
                    <td className="p-2">{s.student_name}</td>
                    <td className="p-2 text-center">{s.matricule}</td>
                    <td className="p-2 text-right">{s.avg}</td>
                  </tr>
                ))}
                {!data.top_students.length && <tr><td className="p-3 text-gray-500" colSpan={3}>No data.</td></tr>}
              </tbody>
            </table>
          </Card>

          {/* Optional: table complète des élèves */}
          <Card title="All students (read-only)">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="p-2 text-left">Student</th>
                <th className="p-2">Matricule</th>
                <th className="p-2 text-right">Average</th>
              </tr></thead>
              <tbody>
                {data.students.map(s=>(
                  <tr key={s.enrollment_id} className="border-t">
                    <td className="p-2">{s.student_name}</td>
                    <td className="p-2 text-center">{s.matricule}</td>
                    <td className="p-2 text-right">{s.avg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}

function KPI({ title, value }){
  return (
    <div className="border rounded p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
function Card({ title, children }){
  return (
    <div className="border rounded">
      <div className="p-2 bg-gray-50 font-semibold">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}
