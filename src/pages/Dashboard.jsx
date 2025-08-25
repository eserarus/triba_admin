import { Link } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function Dashboard() {
  const user = useAuth((s) => s.user);
  const abilities = useAuth((s) => s.abilities);
  const logout = useAuth((s) => s.logout);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">
                  Hoş geldin,{" "}
                  <span className="font-semibold">{user?.name}</span> ·{" "}
                  {user?.email} ·
                  <span
                    className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                      abilities?.includes("admin")
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {abilities?.includes("admin") ? "👑 Admin" : "👤 Kullanıcı"}
                  </span>
                </p>
              </div>
            </div>
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

        {/* Admin Panel - Sadece admin görür */}
        {abilities?.includes("admin") && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/admin/users" className="group block">
                <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300 transform group-hover:scale-[1.02] border-2 border-purple-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
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
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition duration-200">
                        👑 Kullanıcı Yönetimi
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Kullanıcıları yönet
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/admin/categories" className="group block">
                <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300 transform group-hover:scale-[1.02] border-2 border-green-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
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
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition duration-200">
                        🏷️ Kategori Yönetimi
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Kategorileri yönet
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/admin/attributes" className="group block">
                <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300 transform group-hover:scale-[1.02] border-2 border-orange-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
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
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition duration-200">
                        ⚙️ Özellik Yönetimi
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Ürün özelliklerini yönet
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/admin/category-attributes" className="group block">
                <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300 transform group-hover:scale-[1.02] border-2 border-blue-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
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
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition duration-200">
                        🔗 Kategori-Özellik Eşleştirme
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Kategorilere özellik ata
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Info Message for Normal Users */}
        {!abilities?.includes("admin") && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Normal Kullanıcı Hesabı
                </h4>
                <p className="text-gray-600 text-sm">
                  Şu anda normal kullanıcı yetkilerine sahipsiniz. Admin
                  özelliklerine erişiminiz bulunmuyor.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
