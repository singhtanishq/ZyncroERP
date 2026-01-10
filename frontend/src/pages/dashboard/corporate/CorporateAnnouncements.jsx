import { useEffect, useState } from "react";
import { Megaphone, Plus, Pencil, Trash2, Power } from "lucide-react";
import api from "../../../lib/api/apiClient";
import DataTable from "../../../components/common/DataTable";
import StatusBadge from "../../../components/common/StatusBadge";
import AppModal from "../../../components/common/AppModal";
import { EmptyState } from "../../../components/common/States";
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
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[rgb(var(--zx-text))] flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-brand-teal-500/10 text-brand-teal-600 dark:text-brand-teal-300">
              <Megaphone size={24} />
            </span>
            Company Announcements
          </h1>
          <p className="text-[rgb(var(--zx-text-muted))] mt-2 text-sm">
            Publish company-wide notices to the employee portal.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-teal-500 hover:bg-brand-teal-600 transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Announcement
        </button>
      </div>

      <DataTable
        columns={[
          {
            key: "title",
            header: "Announcement",
            render: (r) => (
              <div className="max-w-md">
                <p className="font-semibold text-[rgb(var(--zx-text))]">{r.title}</p>
                <p className="text-xs text-[rgb(var(--zx-text-muted))] line-clamp-1">{r.body}</p>
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
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() => openEdit(row)}
              title="Edit"
              className="p-2 rounded-lg text-[rgb(var(--zx-text-muted))] hover:text-brand-blue-700 hover:bg-brand-blue-500/10 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => toggle(row)}
              title={row.status === "active" ? "Archive" : "Publish"}
              className="p-2 rounded-lg text-[rgb(var(--zx-text-muted))] hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
            >
              <Power size={15} />
            </button>
            <button
              type="button"
              onClick={() => setDeleteRow(row)}
              title="Delete"
              className="p-2 rounded-lg text-[rgb(var(--zx-text-muted))] hover:text-red-600 hover:bg-red-500/10 transition-colors"
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

      {/* CREATE / EDIT */}
      <AppModal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "New Announcement" : "Edit Announcement"}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModal(null)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[rgb(var(--zx-text-muted))] hover:bg-[rgb(var(--zx-surface-hover))] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-teal-500 hover:bg-brand-teal-600 disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving…" : modal?.mode === "create" ? "Publish" : "Save Changes"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))] mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement title"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgb(var(--zx-bg))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] focus:outline-none focus:ring-2 focus:ring-brand-teal-500/40 focus:border-brand-teal-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))] mb-1.5">
              Body
            </label>
            <textarea
              rows={7}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write the announcement…"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgb(var(--zx-bg))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] focus:outline-none focus:ring-2 focus:ring-brand-teal-500/40 focus:border-brand-teal-500 transition resize-y"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[rgb(var(--zx-text-muted))] mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[rgb(var(--zx-bg))] border border-[rgb(var(--zx-border))] text-[rgb(var(--zx-text))] focus:outline-none focus:ring-2 focus:ring-brand-teal-500/40 focus:border-brand-teal-500 transition"
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
          <>
            <button
              type="button"
              onClick={() => setDeleteRow(null)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[rgb(var(--zx-text-muted))] hover:bg-[rgb(var(--zx-surface-hover))] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={destroy}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Delete Permanently
            </button>
          </>
        }
      >
        <p className="text-sm text-[rgb(var(--zx-text-muted))]">
          Delete <strong className="text-[rgb(var(--zx-text))]">{deleteRow?.title}</strong>? This
          permanently removes the announcement for all employees. This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
