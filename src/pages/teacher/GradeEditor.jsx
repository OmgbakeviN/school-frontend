// src/pages/teacher/GradeEditor.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../lib/api";

export default function GradeEditor() {
  const [params] = useSearchParams();
  const classSubjectId = Number(params.get("class_subject")); // id de ClassSubject (Matière de la classe)
  const classroomId = Number(params.get("classroom"));        // id de la Classe

  const [loading, setLoading] = useState(true);
  const [termId, setTermId] = useState(null);
  const [terms, setTerms] = useState([]);
  const [activeCA, setActiveCA] = useState("CA1"); // "CA1" | "CA2"
  const [assessmentId, setAssessmentId] = useState(null);

  const [classroom, setClassroom] = useState(null);
  const [subjectLabel, setSubjectLabel] = useState("");

  const [enrollments, setEnrollments] = useState([]);              // élèves de la classe
  const [enrollmentSubjects, setEnrollmentSubjects] = useState([]); // ES filtrés sur CE class_subject
  const [scores, setScores] = useState(new Map());                  // Map<enrollment_subject_id, number>

  // 🔎 validations initiales
  if (!classSubjectId || !classroomId) {
    return (
      <div className="p-4 text-red-600">
        Missing query params. Expected: <code>?class_subject=ID&classroom=ID</code>
      </div>
    );
  }

  // 1) Charge classe (pour l'année) + infos de la matière (libellé)
  useEffect(() => {
    async function bootMeta() {
      try {
        const [cls, cs] = await Promise.all([
          api.get(`/api/core/classes/${classroomId}/`),                 // ✅ retrieve par id
          api.get(`/api/subjects/class-subjects/${classSubjectId}/`)    // ✅ retrieve du class_subject
        ]);
        setClassroom(cls.data);
        // petit label "code — name"
        const subj = cs.data?.subject || cs.data?.subject_id;
        const subjCode = cs.data?.subject?.code || cs.data?.subject_code || "";
        const subjName = cs.data?.subject?.name || cs.data?.subject_name || "";
        setSubjectLabel(`${subjCode || ""}${subjCode && subjName ? " — " : ""}${subjName || ""}`);

        // charge les terms de l'année de la classe
        const { data: termsResp } = await api.get("/api/core/terms/", { params: { year: cls.data.year } });
        const sorted = [...termsResp].sort((a,b)=>a.index-b.index);
        setTerms(sorted);
        setTermId(sorted[0]?.id || null);
      } catch (e) {
        console.error(e);
        alert("Failed to load classroom/subject metadata.");
      }
    }
    bootMeta();
  }, [classroomId, classSubjectId]);

  // 2) Charge roster + ES de CE cours (évite Subject mismatch)
  useEffect(() => {
    async function loadRosterAndES() {
      if (!classroomId || !classSubjectId) return;
      try {
        const [E, ES] = await Promise.all([
          api.get("/api/enrollments/", { params: { classroom: classroomId } }),
          api.get("/api/enrollment-subjects/", {
            params: {
              "enrollment__classroom": classroomId,
              class_subject: classSubjectId,
              selected: 1
            }
          })
        ]);
        setEnrollments(E.data || []);
        setEnrollmentSubjects(ES.data || []);
      } catch (e) {
        console.error(e);
        alert("Failed to load class roster / selected subjects.");
      }
    }
    loadRosterAndES();
  }, [classroomId, classSubjectId]);

  // 3) Assurer l'existence de l'assessment (CA1/CA2) pour le term choisi + charger scores
  useEffect(() => {
    async function ensureAssessmentAndLoadScores() {
      if (!termId || !classSubjectId) return;
      setLoading(true);
      try {
        // crée l'assessment choisi s'il manque (CA1 ou CA2)
        await api.post("/api/assessments/bulk/", {
          term: termId,
          class_subjects: [classSubjectId],
          atypes: [activeCA]
        }).catch(() => { /* si déjà existant, pas grave */ });

        // trouve l'id de l'assessment sélectionné
        const { data: assList } = await api.get("/api/assessments/", {
          params: { term: termId, class_subject: classSubjectId }
        });
        const target = (assList || []).find(a => a.atype === activeCA);
        setAssessmentId(target?.id || null);

        // charge les scores existants pour cet assessment
        if (target?.id) {
          const { data: sc } = await api.get("/api/scores/", { params: { assessment: target.id } });
          const m = new Map();
          (sc || []).forEach(s => {
            // s.enrollment_subject, s.value
            m.set(s.enrollment_subject, Number(s.value));
          });
          setScores(m);
        } else {
          setScores(new Map());
        }
      } catch (e) {
        console.error(e);
        alert("Failed to prepare assessment or load scores.");
      } finally {
        setLoading(false);
      }
    }
    ensureAssessmentAndLoadScores();
  }, [termId, classSubjectId, activeCA]);

  // Map rapide: enrollment_id -> enrollment_subject_id (uniquement pour CE cours)
  const esIdByEnrollmentId = useMemo(() => {
    const m = new Map();
    enrollmentSubjects
      .filter(es => es.class_subject === classSubjectId || es.class_subject_id === classSubjectId)
      .forEach(es => m.set(es.enrollment || es.enrollment_id, es.id));
    return m;
  }, [enrollmentSubjects, classSubjectId]);

  // Save d'une valeur (autosave onBlur)
  const saveOne = async (esId, rawValue) => {
    if (!assessmentId || !esId) return;
    const trimmed = String(rawValue ?? "").trim();
    if (trimmed === "") return; // on ne supprime pas via vide; on ignore

    const num = Number(trimmed);
    if (Number.isNaN(num) || num < 0 || num > 100) {
      alert("Value must be a number between 0 and 100.");
      return;
    }

    try {
      const payload = {
        assessment: assessmentId,
        entries: [{ enrollment_subject: esId, value: num }]
      };
      const { data } = await api.post("/api/scores/bulk/", payload);
      // debug: si skipped -> avertir
      if (data?.skipped?.length) {
        console.warn("Skipped:", data.skipped);
        alert(`Save skipped: ${data.skipped[0]?.reason || "unknown reason"}`);
        return;
      }
      // maj locale (optimiste)
      const next = new Map(scores);
      next.set(esId, num);
      setScores(next);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || "Save failed.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">Grade Editor</h2>
          <p className="text-sm text-gray-600">
            Class: <span className="font-medium">{classroom?.name || `#${classroomId}`}</span>
            {" · "}Subject: <span className="font-medium">{subjectLabel || `#${classSubjectId}`}</span>
          </p>
        </div>
      </div>

      {/* Barres de sélection Term + Assessment */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Term:</label>
        <select
          className="border p-2 rounded"
          value={termId || ""}
          onChange={(e) => setTermId(Number(e.target.value) || null)}
        >
          <option value="">Select term...</option>
          {terms.map((t) => (
            <option key={t.id} value={t.id}>
              Term {t.index}
            </option>
          ))}
        </select>

        <label className="text-sm">Assessment:</label>
        <select
          className="border p-2 rounded"
          value={activeCA}
          onChange={(e) => setActiveCA(e.target.value)}
        >
          <option value="CA1">CA1</option>
          <option value="CA2">CA2</option>
        </select>

        {loading && <span className="text-sm text-gray-500">Loading…</span>}
      </div>

      {/* Grille de saisie */}
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">Student</th>
            <th className="p-2 text-center">Matricule</th>
            <th className="p-2 text-center">{activeCA}</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((e) => {
            const esId = esIdByEnrollmentId.get(e.id) ?? null;
            const value = esId ? (scores.get(esId) ?? "") : "";
            return (
              <tr key={e.id} className="border-t">
                <td className="p-2">{e.student?.full_name || e.student}</td>
                <td className="p-2 text-center">{e.student?.matricule || "—"}</td>
                <td className="p-2 text-center">
                  {esId ? (
                    <input
                      className="border p-1 rounded w-20 text-center"
                      defaultValue={value}
                      onBlur={(ev) => saveOne(esId, ev.target.value)}
                    />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
          {!enrollments.length && (
            <tr>
              <td className="p-3 text-sm text-gray-500" colSpan={3}>
                No students enrolled.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="text-xs text-gray-500">
        • Autosave on blur • Scores must be 0..100 • A dash (—) means the student didn’t select this subject.
      </p>
    </div>
  );
}
