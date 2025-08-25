import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../store/auth";
import {
  NewAttributeModal,
  EditAttributeModal,
  DeleteAttributeModal,
  AttributeValuesModal,
} from "../components/attributes";

// Kategorilere göre gruplanmış attribute görünümü
function AttributesByCategory({ attributes, onEdit, onDelete, onValues }) {
  // Kategorilere göre gruplama
  const groupedAttributes = attributes.reduce((groups, attr) => {
    const categoryKey = attr.category
      ? attr.category.name
      : "Kategori Atanmamış";
    if (!groups[categoryKey]) {
      groups[categoryKey] = [];
    }
    groups[categoryKey].push(attr);
    return groups;
  }, {});

  const categoryKeys = Object.keys(groupedAttributes);

  if (categoryKeys.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Henüz Özellik Yok
        </h3>
        <p className="text-gray-600">
          Yeni özellik eklemek için yukarıdaki butonu kullanın.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categoryKeys.map((categoryName) => (
        <div
          key={categoryName}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          {/* Kategori Başlığı */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg
                className="w-5 h-5 text-purple-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012-2h10"
                />
              </svg>
              {categoryName}
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                {groupedAttributes[categoryName].length} özellik
              </span>
            </h3>
          </div>

          {/* Özellik Listesi */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Özellik Adı
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kod
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zorunlu
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupedAttributes[categoryName].map((attr) => (
                  <tr
                    key={attr.id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {attr.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {attr.code ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded">
                          {attr.code}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attr.type === "text"
                            ? "bg-blue-100 text-blue-800"
                            : attr.type === "number"
                            ? "bg-green-100 text-green-800"
                            : attr.type === "select"
                            ? "bg-purple-100 text-purple-800"
                            : attr.type === "checkbox"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {attr.type === "text"
                          ? "Metin"
                          : attr.type === "number"
                          ? "Sayı"
                          : attr.type === "select"
                          ? "Seçmeli"
                          : attr.type === "checkbox"
                          ? "Çoklu Seçim"
                          : attr.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {attr.is_required ? (
                        <span className="text-red-600 font-medium">Evet</span>
                      ) : (
                        <span className="text-gray-400">Hayır</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {(attr.type === "select" || attr.type === "checkbox") && (
                        <button
                          onClick={() => onValues(attr)}
                          className="text-purple-600 hover:text-purple-900 transition duration-150"
                        >
                          Değerler
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(attr)}
                        className="text-indigo-600 hover:text-indigo-900 transition duration-150"
                      >
                        Düzenle
                      </button>

                      <button
                        onClick={() => onDelete(attr)}
                        className="text-red-600 hover:text-red-900 transition duration-150"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Attributes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showValuesModal, setShowValuesModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [deletingAttribute, setDeletingAttribute] = useState(null);
  const [valuesAttribute, setValuesAttribute] = useState(null);
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/admin/attributes");
      console.log(res);
      setItems(res.data?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Özellikler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddAttribute = async (formData) => {
    try {
      await api.post("/admin/attributes", formData);
      await load();
      setShowAddModal(false);
    } catch (error) {
      console.error("Özellik eklenirken hata:", error);
      throw error;
    }
  };

  const handleEditAttribute = async (id, formData) => {
    try {
      await api.patch(`/admin/attributes/${id}`, formData);
      await load();
      setShowEditModal(false);
      setEditingAttribute(null);
    } catch (error) {
      console.error("Özellik güncellenirken hata:", error);
      throw error;
    }
  };

  const handleDeleteAttribute = async (id) => {
    try {
      await api.delete(`/admin/attributes/${id}`);
      await load();
      setShowDeleteModal(false);
      setDeletingAttribute(null);
    } catch (error) {
      console.error("Özellik silinirken hata:", error);
      throw error;
    }
  };

  const openEditModal = (attribute) => {
    setEditingAttribute(attribute);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingAttribute(null);
  };

  const openDeleteModal = (attribute) => {
    setDeletingAttribute(attribute);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingAttribute(null);
  };

  const openValuesModal = (attribute) => {
    setValuesAttribute(attribute);
    setShowValuesModal(true);
  };

  const closeValuesModal = () => {
    setShowValuesModal(false);
    setValuesAttribute(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ⚙️ Özellik Yönetimi
                </h1>
                <p className="text-gray-600">
                  Admin: <span className="font-semibold">{user?.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Yeni Özellik</span>
              </button>
              <Link
                to="/dashboard"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Dashboard</span>
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mx-auto mb-2 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              <p className="text-gray-600 text-sm">Toplam Özellik</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl mx-auto mb-2 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter((attr) => attr.is_required).length}
              </p>
              <p className="text-gray-600 text-sm">Zorunlu Özellik</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mx-auto mb-2 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(items.map((attr) => attr.category?.id)).size}
              </p>
              <p className="text-gray-600 text-sm">Farklı Kategori</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {err && (
          <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 border-l-4 border-red-500">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Hata</h4>
                <p className="text-gray-600 text-sm">{err}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Ürün Özellikleri
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Yükleniyor...</span>
            </div>
          ) : err ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{err}</p>
            </div>
          ) : (
            <AttributesByCategory
              attributes={items}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onValues={openValuesModal}
            />
          )}
        </div>

        <NewAttributeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddAttribute}
        />

        <EditAttributeModal
          isOpen={showEditModal}
          attribute={editingAttribute}
          onClose={closeEditModal}
          onSave={handleEditAttribute}
        />

        <DeleteAttributeModal
          isOpen={showDeleteModal}
          attribute={deletingAttribute}
          onClose={closeDeleteModal}
          onDelete={handleDeleteAttribute}
        />

        <AttributeValuesModal
          isOpen={showValuesModal}
          attribute={valuesAttribute}
          onClose={closeValuesModal}
        />
      </div>
    </div>
  );
}
