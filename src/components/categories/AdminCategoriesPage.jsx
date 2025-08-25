import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import AdminLayout from "../AdminLayout";

export default function AdminCategoriesPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/admin/categories"); // GET list
      setItems(res.data?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (catId) => {
    if (!confirm("Kategori silinsin mi?")) return;
    await api.delete(`/admin/categories/${catId}`);
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  // Hierarchical view helper
  const organizedData = useMemo(() => {
    const parents = items.filter((cat) => !cat.parent_id);
    const result = [];
    parents.forEach((parent) => {
      result.push({ ...parent, level: 0 });
      const subs = items.filter((cat) => cat.parent_id === parent.id);
      subs.forEach((sub) => {
        result.push({ ...sub, level: 1 });
      });
    });
    return result;
  }, [items]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Categories</h1>
        <button
          onClick={() => navigate("/admin/categories/new")}
          className="px-3 py-2 rounded bg-black text-white text-sm"
        >
          + New Category
        </button>
      </div>

      {err && <div className="text-red-600 mb-3">{err}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2">Name (en)</th>
                <th className="text-left p-2">Name (me)</th>
                <th className="text-left p-2">Parent</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2 w-80">Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizedData.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">
                    <span style={{ marginLeft: `${c.level * 20}px` }}>
                      {c.level > 0 && "└─ "}
                      {c.name_en}
                    </span>
                  </td>
                  <td className="p-2">{c.name_me}</td>
                  <td className="p-2">
                    {c.parent_id ? (
                      <span className="text-blue-600">
                        {items.find((p) => p.id === c.parent_id)?.name_en ||
                          "Unknown"}
                      </span>
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
                  </td>
                  <td className="p-2">
                    {c.status ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </td>
                  <td className="p-2 space-x-2">
                    <Link
                      className="underline"
                      to={`/admin/categories/${c.id}/edit`}
                    >
                      Edit
                    </Link>
                    <Link
                      className="underline"
                      to={`/admin/categories/${c.id}/attributes`}
                    >
                      Attributes
                    </Link>
                    <button
                      className="underline text-red-600"
                      onClick={() => remove(c.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="p-2 text-gray-500" colSpan={5}>
                    No categories
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
