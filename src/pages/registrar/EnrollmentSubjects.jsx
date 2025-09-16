import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import { useSearchParams } from "react-router-dom";

export default function EnrollmentSubjects() {
  const [params] = useSearchParams();
  const enrollmentId = Number(params.get("enrollment"));
  const classroomId = Number(params.get("classroom"));

  const [classSubjects, setClassSubjects] = useState([]);
  const [selected, setSelected] = useState([]); // EnrollmentSubjectDetail list (Option A)
  const [loading, setLoading] = useState(true);

  const selectedMap = useMemo(() => {
    const m = new Map();
    selected.forEach(x => m.set(x.subject_id, x)); // by subject_id
    return m;
  }, [selected]);

  const load = async () => {
    setLoading(true);
    const [cs, es] = await Promise.all([
      api.get("/api/subjects/class-subjects/by-class/", { params: { classroom: classroomId } }),
      api.get(`/api/enrollments/${enrollmentId}/subjects/`)
    ]);
    setClassSubjects(cs.data); // [{id, subject_id, subject_code, subject_name, coefficient, ...}]
    setSelected(es.data);      // [{id (enrollment_subject), subject_id, subject_code, ...}]
    setLoading(false);
  };
  useEffect(() => { if (enrollmentId && classroomId) load(); }, [enrollmentId, classroomId]);

  const toggle = async (cs) => {
    const existing = selectedMap.get(cs.subject_id);
    if (existing) {
      // remove -> DELETE /enrollment-subjects/{id}/
      await api.delete(`/api/enrollment-subjects/${existing.id}/`);
    } else {
      // add -> POST /enrollment-subjects/
      await api.post("/api/enrollment-subjects/", {
        enrollment: enrollmentId,
        class_subject: cs.id,
        selected: true
      });
    }
    load();
  };

  const updateOverride = async (esId, newCoef) => {
    await api.patch(`/api/enrollment-subjects/${esId}/`, { coef_override: Number(newCoef) || null });
    load();
  };

  const [terms, setTerms] = useState([]);
  const [termId, setTermId] = useState(null);

  // charger les terms de l'année de la classe
  useEffect(() => {
    if (!classroomId) return;
    (async () => {
      try {
        // récupérer la classe pour connaître l'année
        const { data: cls } = await api.get(`/api/core/classes/${classroomId}/`);
        const yearId = cls.year; // selon ton serializer, adapte si nécessaire
        const { data: t } = await api.get("/api/core/terms/", { params: { year: yearId } });
        setTerms(t);
        setTermId(t[0]?.id || null);
      } catch (e) {
        console.error(e);
        alert("Impossible de charger les trimestres.");
      }
    })();
  }, [classroomId]);

  const downloadStudentPdf = async () => {
    if (!enrollmentId || !termId) {
      return alert("Sélectionne un trimestre d'abord.");
    }
    try {
      const resp = await api.get("/api/reports/pdf/student/", {
        params: { enrollment: enrollmentId, term: termId },
        responseType: "blob",
      });
      // Nom de fichier (si l'API envoie Content-Disposition on l'utilise, sinon fallback)
      let filename = `student_${enrollmentId}_T${termId}.pdf`;
      const cd = resp.headers["content-disposition"];
      if (cd) {
        const m = /filename="([^"]+)"/.exec(cd);
        if (m) filename = m[1];
      }
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      URL.revokeObjectURL(url); a.remove();
    } catch (e) {
      console.error(e);
      alert("Échec du téléchargement du PDF élève.");
    }
  };

  if (!enrollmentId || !classroomId) {
    return <div className="p-4 text-sm text-red-600">Missing enrollment or classroom id.</div>;
  }
  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Assign Subjects to Student</h2>
      <p className="text-sm text-gray-600">Enrollment #{enrollmentId} — Classroom #{classroomId}</p>

      <div className="flex items-center gap-2 mb-4">
        <select
          className="border p-2 rounded"
          value={termId || ""}
          onChange={(e) => setTermId(Number(e.target.value) || null)}
        >
          <option value="">Trimestre…</option>
          {terms.sort((a, b) => a.index - b.index).map(t => (
            <option key={t.id} value={t.id}>Term {t.index}</option>
          ))}
        </select>

        <button className="px-3 py-2 rounded border" onClick={downloadStudentPdf}>
          Export PDF (élève)
        </button>
      </div>


      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">Subject</th>
            <th className="p-2 text-center">Default Coef</th>
            <th className="p-2 text-center">Selected</th>
            <th className="p-2 text-center">Override Coef</th>
            <th className="p-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {classSubjects.map(cs => {
            const es = selectedMap.get(cs.subject_id); // EnrollmentSubjectDetail (Option A)
            return (
              <tr key={cs.id} className="border-t">
                <td className="p-2">{cs.subject_code} — {cs.subject_name}</td>
                <td className="p-2 text-center">{cs.coefficient}</td>
                <td className="p-2 text-center">{es ? "Yes" : "No"}</td>
                <td className="p-2 text-center">
                  {es ? (
                    <input className="border p-1 rounded w-24 text-center"
                      defaultValue={es.coef_override || ""}
                      placeholder="(none)"
                      onBlur={e => updateOverride(es.id, e.target.value)}
                    />
                  ) : <span className="text-gray-400">—</span>}
                </td>
                <td className="p-2 text-center">
                  <button className="px-2 py-1 rounded border" onClick={() => toggle(cs)}>
                    {es ? "Remove" : "Add"}
                  </button>
                </td>
              </tr>
            );
          })}
          {!classSubjects.length && (
            <tr><td className="p-3 text-sm text-gray-500" colSpan={5}>No class subjects defined yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
