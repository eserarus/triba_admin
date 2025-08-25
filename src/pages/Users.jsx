import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../store/auth";
import { EditUserModal, ConfirmModal } from "../components/users";

export default function Users() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/admin/users");
      setItems(res.data?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openConfirmModal = (user, action) => {
    setConfirmUser(user);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmUser(null);
    setConfirmAction(null);
  };

  const handleConfirmAction = async () => {
    if (!confirmUser || !confirmAction) return;

    try {
      if (confirmAction === "toggleAdmin") {
        await api.post(`/admin/users/${confirmUser.id}/toggle-admin`);
      } else if (confirmAction === "delete") {
        await api.delete(`/admin/users/${confirmUser.id}`);
      }
      await load();
      closeConfirmModal();
    } catch (error) {
      console.error("İşlem sırasında hata:", error);
    }
  };

  const toggleAdmin = (user) => {
    openConfirmModal(user, "toggleAdmin");
  };

  const remove = (user) => {
    openConfirmModal(user, "delete");
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (formData) => {
    if (!editingUser) return;

    try {
      await api.patch(`/admin/users/${editingUser.id}`, formData);
      await load();
      closeEditModal();
    } catch (error) {
      console.error("Kullanıcı güncellenirken hata:", error);
    }
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  👑 Kullanıcı Yönetimi
                </h1>
                <p className="text-gray-600">
                  Admin: <span className="font-semibold">{user?.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              <p className="text-gray-600 text-sm">Toplam Kullanıcı</p>
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter((u) => u.abilities?.includes("admin")).length}
              </p>
              <p className="text-gray-600 text-sm">Admin Kullanıcı</p>
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter((u) => !u.abilities?.includes("admin")).length}
              </p>
              <p className="text-gray-600 text-sm">Normal Kullanıcı</p>
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

        {/* Users List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Kullanıcı Listesi
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Sistemdeki tüm kullanıcıları yönetin
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <p className="text-gray-600">Kullanıcılar yükleniyor...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E-posta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yetki
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kayıt Tarihi
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((userItem) => (
                    <tr
                      key={userItem.id}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {userItem.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {userItem.name}
                            </p>
                            <p className="text-gray-600 text-sm">
                              ID: {userItem.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{userItem.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {userItem.abilities?.includes("admin") ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            👑 Admin
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            👤 Kullanıcı
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(userItem.created_at).toLocaleDateString(
                          "tr-TR"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(userItem)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition duration-200 text-sm flex items-center space-x-1"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <span>Düzenle</span>
                          </button>
                          <button
                            onClick={() => toggleAdmin(userItem)}
                            className={`px-3 py-1 rounded-lg transition duration-200 text-sm flex items-center space-x-1 ${
                              userItem.abilities?.includes("admin")
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>
                              {userItem.abilities?.includes("admin")
                                ? "Admin Kaldır"
                                : "Admin Yap"}
                            </span>
                          </button>
                          <button
                            onClick={() => remove(userItem)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition duration-200 text-sm flex items-center space-x-1"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span>Sil</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="p-8 text-center">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Kullanıcı Bulunamadı
              </h3>
              <p className="text-gray-600">
                Henüz sistemde kullanıcı bulunmuyor.
              </p>
            </div>
          )}
        </div>

        {/* Modal Components */}
        <EditUserModal
          isOpen={showEditModal}
          user={editingUser}
          onClose={closeEditModal}
          onSave={handleSaveUser}
        />

        <ConfirmModal
          isOpen={showConfirmModal}
          user={confirmUser}
          action={confirmAction}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
        />
      </div>
    </div>
  );
}
