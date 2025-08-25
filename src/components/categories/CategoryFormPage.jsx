import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import AdminLayout from "../AdminLayout";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function CategoryFormPage() {
  const { id } = useParams(); // edit varsa id var
  const isEdit = Boolean(id);
  const q = useQuery();
  const parentFromQuery = q.get("parent");
  const [payload, setPayload] = useState({
    parent_id: parentFromQuery ? Number(parentFromQuery) : null,
    name_en: "",
    name_me: "",
    status: 1,
  });
  const [parents, setParents] = useState([]);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const loadParents = async () => {
    const res = await api.get("/admin/categories");
    setParents((res.data?.data || []).filter((c) => !c.parent_id));
  };

  const loadItem = async () => {
    if (!isEdit) return;
    const res = await api.get(`/admin/categories/${id}`); // GET one
    const d = res.data?.data;
    setPayload({
      parent_id: d.parent_id,
      name_en: d.name_en || "",
      name_me: d.name_me || "",
      status: d.status ?? 1,
    });
  };

  useEffect(() => {
    loadParents();
    loadItem();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      if (isEdit) {
        await api.patch(`/admin/categories/${id}`, payload); // UPDATE
      } else {
        await api.post(`/admin/categories`, payload); // CREATE
      }
      navigate("/admin/categories");
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Kaydedilemedi");
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Category" : "New Category"}
      </h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <form
        onSubmit={submit}
        className="max-w-lg space-y-4 bg-white p-4 rounded-lg border"
      >
        <div>
          <label className="text-sm block mb-1">
            Parent Category (optional)
          </label>
          <select
            className="border rounded w-full p-2"
            value={payload.parent_id ?? ""}
            onChange={(e) =>
              setPayload((v) => ({
                ...v,
                parent_id: e.target.value ? Number(e.target.value) : null,
              }))
            }
          >
            <option value="">— None (Top Level) —</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm block mb-1">Name (English)</label>
          <input
            className="border rounded w-full p-2"
            value={payload.name_en}
            onChange={(e) =>
              setPayload((v) => ({ ...v, name_en: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <label className="text-sm block mb-1">Name (Montenegrin)</label>
          <input
            className="border rounded w-full p-2"
            value={payload.name_me}
            onChange={(e) =>
              setPayload((v) => ({ ...v, name_me: e.target.value }))
            }
            required
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="status"
            type="checkbox"
            className="h-4 w-4"
            checked={Boolean(payload.status)}
            onChange={(e) =>
              setPayload((v) => ({ ...v, status: e.target.checked ? 1 : 0 }))
            }
          />
          <label htmlFor="status" className="text-sm">
            Active
          </label>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-black text-white rounded">
            Save
          </button>
          <button
            type="button"
            onClick={() => history.back()}
            className="px-3 py-2 rounded border"
          >
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
