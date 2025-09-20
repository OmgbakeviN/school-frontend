import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import { Link } from "react-router-dom";


function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-4">
        <div className="flex items-center justify-between border-b pb-2 mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="px-2 py-1 rounded hover:bg-gray-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function RegistrarTeachers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // modals
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // form create
  const [createUserId, setCreateUserId] = useState("");
  const [createStaffCode, setCreateStaffCode] = useState("");

  // form edit
  const [editStaffCode, setEditStaffCode] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/portal/teachers/");
      setRows(data || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load teachers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(r => {
      const uname = r.username || "";
      const fn = r.fullname || "";
      const ln = r.email || "";
      const staff = r.staff_code || "";
      return [uname, fn, ln, staff].some(x => String(x).toLowerCase().includes(term));
    });
  }, [rows, q]);

  const onCreate = async (ev) => {
    ev.preventDefault();
    if (!createUserId) { alert("Provide User ID"); return; }
    try {
      await api.post("/api/portal/teachers/", {
        user: Number(createUserId),
        staff_code: createStaffCode || ""
      });
      setOpenCreate(false);
      setCreateUserId(""); setCreateStaffCode("");
      await load();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || "Create failed.");
    }
  };

  const onOpenEdit = (row) => {
    setEditRow(row);
    setEditStaffCode(row.staff_code || "");
    setOpenEdit(true);
  };

  const onEdit = async (ev) => {
    ev.preventDefault();
    if (!editRow) return;
    try {
      await api.patch(`/api/portal/teachers/${editRow.id}/`, {
        staff_code: editStaffCode
      });
      setOpenEdit(false);
      setEditRow(null);
      await load();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || "Update failed.");
    }
  };

  const onDelete = async (row) => {
    if (!confirm(`Delete teacher ${row.user?.username || row.id}?`)) return;
    try {
      await api.delete(`/api/portal/teachers/${row.id}/`);
      await load();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.detail || "Delete failed.");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Teachers</h2>
          <p className="text-sm text-gray-600">Link existing users to Teacher profiles, edit staff codes, remove profiles.</p>
        </div>
        <Link className="px-3 py-2 rounded border" to="/registrar/teachers/new">
          + New Teacher
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <input
          className="border p-2 rounded w-72"
          placeholder="Search (name, username, staff code)…"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <button className="px-2 py-1 rounded border" onClick={load}>Refresh</button>
      </div>

      <div className="border rounded overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Staff code</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="p-3" colSpan={4}>Loading…</td></tr>}
            {!loading && filtered.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2">
                  <div className="font-medium">{r.user?.first_name} {r.user?.last_name}</div>
                  <div className="text-xs text-gray-500">@{r.username}</div>
                </td>
                <td className="p-2">{r.email || "—"}</td>
                <td className="p-2">{r.staff_code || "—"}</td>
                <td className="p-2 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <button className="px-2 py-1 rounded border" onClick={()=>onOpenEdit(r)}>Edit</button>
                    <button className="px-2 py-1 rounded border text-red-600" onClick={()=>onDelete(r)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !filtered.length && (
              <tr><td className="p-3 text-sm text-gray-500" colSpan={4}>No teachers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      <Modal open={openCreate} onClose={()=>setOpenCreate(false)} title="Create Teacher">
        <form onSubmit={onCreate} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">User ID<span className="text-red-600">*</span></label>
            <input className="border rounded p-2 w-full" value={createUserId} onChange={e=>setCreateUserId(e.target.value)} placeholder="e.g. 42" />
            <p className="text-xs text-gray-500 mt-1">Entrer l’ID d’un utilisateur existant (rôle TEACHER). Si tu n’as pas de liste, tu peux regarder l’ID dans l’admin Django.</p>
          </div>
          <div>
            <label className="block text-sm mb-1">Staff code</label>
            <input className="border rounded p-2 w-full" value={createStaffCode} onChange={e=>setCreateStaffCode(e.target.value)} placeholder="OPTIONNEL" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="px-3 py-2 rounded border" onClick={()=>setOpenCreate(false)}>Cancel</button>
            <button type="submit" className="px-3 py-2 rounded bg-black text-white">Save</button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal open={openEdit} onClose={()=>setOpenEdit(false)} title={`Edit Teacher ${editRow?.user?.username || ""}`}>
        <form onSubmit={onEdit} className="space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">User</div>
            <div className="border rounded p-2 bg-gray-50">
              <div className="font-medium">{editRow?.user?.first_name} {editRow?.user?.last_name}</div>
              <div className="text-xs text-gray-500">@{editRow?.user?.username}</div>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Staff code</label>
            <input className="border rounded p-2 w-full" value={editStaffCode} onChange={e=>setEditStaffCode(e.target.value)} />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="px-3 py-2 rounded border" onClick={()=>setOpenEdit(false)}>Cancel</button>
            <button type="submit" className="px-3 py-2 rounded bg-black text-white">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}