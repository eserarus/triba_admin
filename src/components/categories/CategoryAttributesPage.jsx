import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import AdminLayout from "../AdminLayout";

export default function CategoryAttributesPage() {
  const { id } = useParams(); // category id
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const catRes = await api.get(`/admin/categories/${id}`);
      setCategory(catRes.data?.data);
      const res = await api.get(`/admin/categories/${id}/attributes`); // GET attributes by category
      setItems(res.data?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (attrId) => {
    if (!confirm("Attribute silinsin mi?")) return;
    await api.delete(`/admin/attributes/${attrId}`);
    await load();
  };

  useEffect(() => {
    load();
  }, [id]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Attributes</h1>
          {category && (
            <div className="text-sm text-gray-600">
              Category: <b>{category.name_en}</b>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate(`/admin/categories/${id}/attributes/new`)}
          className="px-3 py-2 rounded bg-black text-white text-sm"
        >
          + New Attribute
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
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Required</th>
                <th className="text-left p-2 w-56">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">{a.name_en}</td>
                  <td className="p-2">{a.name_me}</td>
                  <td className="p-2">{a.type}</td>
                  <td className="p-2">{a.is_required ? "Yes" : "No"}</td>
                  <td className="p-2 space-x-2">
                    <Link
                      className="underline"
                      to={`/admin/attributes/${a.id}/edit`}
                    >
                      Edit
                    </Link>
                    {(a.type === "select" || a.type === "checkbox") && (
                      <Link
                        className="underline"
                        to={`/admin/attributes/${a.id}/values`}
                      >
                        Values
                      </Link>
                    )}
                    <button
                      className="underline text-red-600"
                      onClick={() => remove(a.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="p-2 text-gray-500" colSpan={5}>
                    No attributes
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
