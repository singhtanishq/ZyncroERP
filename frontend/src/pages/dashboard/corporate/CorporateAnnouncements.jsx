import { useEffect, useState } from "react";
import { Megaphone, Plus, Pencil, Trash2, Power } from "lucide-react";
import api from "../../../lib/api/apiClient";
import DataTable from "../../../components/common/DataTable";
import StatusBadge from "../../../components/common/StatusBadge";
import AppModal from "../../../components/common/AppModal";
import { formatDate } from "../../../utils/format";
import { useToast } from "../../../components/common/ToastProvider";

/**
 * Admin management of company-wide announcements published to employees.
 */
export default function CorporateAnnouncements() {
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', row? }
  const [deleteRow, setDeleteRow] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", status: "active" });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/corporate/announcements");
      setRows(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({ title: "", body: "", status: "active" });
    setModal({ mode: "create" });
  };

  const openEdit = (row) => {
    setForm({ title: row.title, body: row.body, status: row.status });
    setModal({ mode: "edit", row });
  };

  const save = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast("Title and body are required.", "error");
      return;
    }

    setSaving(true);
    try {
      if (modal.mode === "create") {
        await api.post("/corporate/announcements", form);
        toast("Announcement published.", "success");
      } else {
        await api.put(`/corporate/announcements/${modal.row.id}`, form);
        toast("Announcement updated.", "success");
      }
      setModal(null);
      load();
    } catch (e) {
      toast(e?.response?.data?.message || "Failed to save the announcement.", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (row) => {
    try {
      await api.patch(`/corporate/announcements/${row.id}/toggle`);
      load();
    } catch (e) {
      toast(e?.response?.data?.message || "Failed to update status.", "error");
    }
  };

  const destroy = async () => {
    try {
      await api.delete(`/corporate/announcements/${deleteRow.id}`);
      toast("Announcement deleted.", "success");
      setDeleteRow(null);
      load();
    } catch (e) {
      toast(e?.response?.data?.message || "Failed to delete.", "error");
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-0 space-y-8 animate-fade-in font-sans">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal-500/10 border border-brand-teal-500/20 text-[11px] font-bold tracking-widest text-brand-teal-500 uppercase w-max mb-1">
            <Megaphone size={14} strokeWidth={2.5} />
            Company Portal
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[rgb(var(--zx-text))]">
            Company Announcements
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-1 text-[15px] max-w-xl leading-relaxed">
            Publish company-wide notices to the employee portal.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-brand-teal-500 hover:bg-brand-teal-600 shadow-lg shadow-brand-teal-500/25 transition-all active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span>New Announcement</span>
        </button>
      </div>

      <div className="relative z-10">
        <DataTable
          columns={[
            {
              key: "title",
              header: "Announcement",
              render: (r) => (
                <div className="max-w-md">
                  <p className="font-bold text-[rgb(var(--zx-text))]">{r.title}</p>
                  <p className="text-xs text-[rgb(var(--zx-text-muted))] line-clamp-1 font-medium mt-0.5">{r.body}</p>
                </div>
              ),
            },
            { key: "author.name", header: "Published By", render: (r) => r.author?.name || "—", sortable: false },
            { key: "created_at", header: "Published", render: (r) => formatDate(r.created_at), sortable: false },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={load}
          searchPlaceholder="Search announcements…"
          rowActions={(row) => (
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openEdit(row)}
                title="Edit"
                className="p-2 rounded-xl text-[rgb(var(--zx-text-muted))] hover:text-brand-teal-500 hover:bg-brand-teal-500/10 transition-colors border border-transparent hover:border-brand-teal-500/20"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => toggle(row)}
                title={row.status === "active" ? "Archive" : "Publish"}
                className="p-2 rounded-xl text-[rgb(var(--zx-text-muted))] hover:text-amber-500 hover:bg-amber-500/10 transition-colors border border-transparent hover:border-amber-500/20"
              >
                <Power size={15} />
              </button>
              <button
                type="button"
                onClick={() => setDeleteRow(row)}
                title="Delete"
                className="p-2 rounded-xl text-[rgb(var(--zx-text-muted))] hover:text-rose-500 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
          empty={{
            icon: Megaphone,
            title: "No announcements yet",
            description: "Published announcements will appear here.",
          }}
        />
      </div>

      {/* CREATE / EDIT */}
      <AppModal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "New Announcement" : "Edit Announcement"}
        size="lg"
        footer={
          <div className="w-full flex justify-between items-center">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-teal-500 hover:bg-brand-teal-600 disabled:opacity-60 shadow-lg shadow-brand-teal-500/20 transition-all active:scale-95"
            >
              {saving ? "Saving…" : modal?.mode === "create" ? "Publish" : "Save Changes"}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <p className="text-xs text-[rgb(var(--zx-text-muted))] font-medium -mt-2">
            {modal?.mode === "create" ? "Publish a new company notice" : "Modify announcement details"}
          </p>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 ml-1">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement title"
              className="w-full px-4 py-3 rounded-xl text-sm bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] focus:outline-none focus:border-brand-teal-500 transition-all font-bold shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 placeholder:font-normal"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 ml-1">
              Body
            </label>
            <textarea
              rows={7}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write the announcement…"
              className="w-full px-4 py-3 rounded-xl text-sm bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] focus:outline-none focus:border-brand-teal-500 transition-all font-medium shadow-sm placeholder:text-[rgb(var(--zx-text-muted))]/60 resize-y"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-[rgb(var(--zx-text-muted))] mb-1.5 ml-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-3 rounded-xl text-sm bg-[rgb(var(--zx-surface))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] focus:outline-none focus:border-brand-teal-500 transition-all font-semibold shadow-sm cursor-pointer"
            >
              <option value="active">Active (visible to employees)</option>
              <option value="inactive">Archived (hidden)</option>
            </select>
          </div>
        </div>
      </AppModal>

      {/* DELETE CONFIRMATION */}
      <AppModal
        open={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        title="Delete Announcement"
        size="sm"
        tone="danger"
        footer={
          <div className="w-full flex justify-between items-center">
            <button
              type="button"
              onClick={() => setDeleteRow(null)}
              className="px-5 py-2.5 rounded-xl border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] text-sm font-semibold hover:bg-[rgb(var(--zx-surface-hover))] transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={destroy}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all active:scale-95"
            >
              Delete Permanently
            </button>
          </div>
        }
      >
        <p className="text-sm text-[rgb(var(--zx-text-muted))] font-medium">
          Delete <strong className="text-[rgb(var(--zx-text))] font-bold">{deleteRow?.title}</strong>? This
          permanently removes the announcement for all employees. This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}