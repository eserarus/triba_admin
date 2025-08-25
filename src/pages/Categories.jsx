import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../store/auth";
import {
  AddCategoryModal,
  EditCategoryModal,
  DeleteCategoryModal,
} from "../components/categories";

// Kategorileri collapsible hiyerarşi için organize eden fonksiyon
function organizeCategories(categories, expandedCategories = new Set()) {
  const organized = [];

  // Recursive function to add categories and their children
  const addCategoryAndChildren = (
    category,
    level = 0,
    parentExpanded = true
  ) => {
    // Ana kategoriler veya parent'ı açık olan kategoriler gösterilir
    const shouldShow = level === 0 || parentExpanded;

    if (shouldShow) {
      const hasChildren = categories.some(
        (cat) => cat.parent_id === category.id
      );
      const isExpanded = expandedCategories.has(category.id);

      organized.push({
        ...category,
        isSubCategory: level > 0,
        level: level,
        hasChildren: hasChildren,
        isExpanded: isExpanded,
      });

      // Bu kategorinin alt kategorilerini bul ve ekle (eğer kategori açıksa)
      if (hasChildren) {
        const children = categories.filter(
          (cat) => cat.parent_id === category.id
        );
        children.forEach((child) => {
          addCategoryAndChildren(child, level + 1, isExpanded);
        });
      }
    }
  };

  // Önce ana kategorileri (parent_id olmayan) bul ve işle
  const rootCategories = categories.filter((cat) => !cat.parent_id);
  rootCategories.forEach((root) => {
    addCategoryAndChildren(root, 0, true);
  });

  return organized;
}

export default function Categories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [isReordering, setIsReordering] = useState(false);
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/admin/categories");
      setItems(res.data?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Kategoriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Arama filtresi - hem eşleşen kategorileri hem de onların parent'larını göster
  const filteredItems = (() => {
    if (!searchTerm.trim()) return items;

    const searchLower = searchTerm.toLowerCase();
    const matchingCategories = new Set();

    // Eşleşen kategorileri bul
    items.forEach((item) => {
      if (item.name?.toLowerCase().includes(searchLower)) {
        matchingCategories.add(item.id);

        // Parent kategorileri de ekle
        let current = item;
        while (current.parent_id) {
          const parent = items.find((p) => p.id === current.parent_id);
          if (parent) {
            matchingCategories.add(parent.id);
            current = parent;
          } else {
            break;
          }
        }
      }
    });

    return items.filter((item) => matchingCategories.has(item.id));
  })();

  // Kategorileri sort alanına göre sırala
  const sortedItems = [...filteredItems].sort((a, b) => {
    // Önce parent_id'ye göre grupla, sonra sort'a göre sırala
    if (a.parent_id !== b.parent_id) {
      if (!a.parent_id && b.parent_id) return -1;
      if (a.parent_id && !b.parent_id) return 1;
      return (a.parent_id || 0) - (b.parent_id || 0);
    }
    return (a.sort || 0) - (b.sort || 0);
  });

  useEffect(() => {
    load();
  }, []);

  const handleAddCategory = async (formData) => {
    try {
      await api.post("/admin/categories", formData);
      await load();
      setShowAddModal(false);
    } catch (error) {
      console.error("Kategori eklenirken hata:", error);
      throw error;
    }
  };

  const handleEditCategory = async (formData) => {
    try {
      await api.patch(`/admin/categories/${selectedCategory.id}`, formData);
      await load();
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Kategori güncellenirken hata:", error);
      throw error;
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await api.delete(`/admin/categories/${selectedCategory.id}`);
      await load();
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Kategori silinirken hata:", error);
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Sort değeri güncelleme
  const handleSortChange = (categoryId, newSort) => {
    console.log("Sort değişiyor:", {
      categoryId,
      newSort,
      type: typeof newSort,
    });

    // Input'ta yazarken local state'i güncelle
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === Number(categoryId)
          ? { ...item, sort: Number(newSort) }
          : item
      );
      console.log(
        "Güncellenmiş items:",
        updatedItems.find((item) => item.id === Number(categoryId))
      );
      return updatedItems;
    });
  };

  // Sort değerini kaydetme (input'tan çıkıldığında)
  const handleSortBlur = async (categoryId) => {
    try {
      setIsReordering(true);

      const category = items.find((cat) => cat.id === categoryId);
      if (!category) return;

      // API'ye gönder - doğru endpoint kullan
      await api.patch(`/admin/categories/${categoryId}/sort`, {
        sort: category.sort,
      });

      // Listeyi yeniden yükle
      await load();
    } catch (error) {
      console.error("Sort değeri güncellenirken hata:", error);
      // Hata durumunda listeyi yeniden yükle
      await load();
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
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
                <h1 className="text-2xl font-bold text-gray-900">
                  🏷️ Kategori Yönetimi
                </h1>
                <p className="text-gray-600">
                  Admin: <span className="font-semibold">{user?.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
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
                <span>Yeni Kategori</span>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {searchTerm.trim()
                  ? `${filteredItems.length}/${items.length}`
                  : items.length}
              </p>
              <p className="text-gray-600 text-sm">
                {searchTerm.trim()
                  ? "Arama Sonucu / Toplam"
                  : "Toplam Kategori"}
              </p>
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
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012-2h10"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter((c) => !c.parent_id).length}
              </p>
              <p className="text-gray-600 text-sm">Ana Kategori</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mx-auto mb-2 flex items-center justify-center">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {items.filter((c) => c.parent_id).length}
              </p>
              <p className="text-gray-600 text-sm">Alt Kategori</p>
            </div>
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {items.reduce((sum, c) => sum + (c.products_count || 0), 0)}
              </p>
              <p className="text-gray-600 text-sm">Toplam Ürün</p>
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

        {/* Categories List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Kategori Listesi
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Sistemdeki tüm kategorileri yönetin
                </p>
              </div>
              {/* Arama Input'u */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-200"
                />
                <svg
                  className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
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
              <p className="text-gray-600">Kategoriler yükleniyor...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün Sayısı
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {organizeCategories(sortedItems, expandedCategories).map(
                    (category) => (
                      <tr
                        key={category.id}
                        className={`hover:bg-gray-50 transition duration-150 ${
                          category.isSubCategory ? "bg-gray-25" : ""
                        } ${category.level === 0 ? "bg-white" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div
                            className={`flex items-center space-x-3`}
                            style={{ marginLeft: `${category.level * 2}rem` }}
                          >
                            {/* Expand/Collapse Button - sadece alt kategorisi olan kategoriler için */}
                            {category.hasChildren && (
                              <button
                                onClick={() => toggleCategory(category.id)}
                                className="flex items-center justify-center w-5 h-5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition duration-150"
                              >
                                {category.isExpanded ? (
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
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                ) : (
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
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                )}
                              </button>
                            )}
                            {!category.hasChildren && (
                              <div className="w-5 h-5"></div>
                            )}

                            <div
                              className={`${
                                category.level === 0
                                  ? "w-10 h-10"
                                  : category.level === 1
                                  ? "w-8 h-8"
                                  : "w-6 h-6"
                              } rounded-full flex items-center justify-center overflow-hidden`}
                              style={{
                                backgroundColor:
                                  category.color ||
                                  (category.level === 0
                                    ? "#10B981"
                                    : category.level === 1
                                    ? "#3B82F6"
                                    : "#8B5CF6"),
                              }}
                            >
                              {/* İkon varsa göster */}
                              {category.icon ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  {/* Font Awesome ikonu (PNG yerine direkt kullan) */}
                                  <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ color: "white" }}
                                  >
                                    <i
                                      className={`fas fa-${category.icon}`}
                                    ></i>
                                  </div>
                                </div>
                              ) : (
                                /* İkon yoksa baş harfi göster */
                                <span
                                  className={`text-white font-semibold ${
                                    category.level === 0
                                      ? "text-sm"
                                      : category.level === 1
                                      ? "text-xs"
                                      : "text-xs"
                                  }`}
                                >
                                  {category.name?.charAt(0)?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                {category.level > 0 && (
                                  <span className="text-gray-400 text-xs">
                                    {"└─".repeat(Math.min(category.level, 3))}
                                  </span>
                                )}
                                <div className="flex items-center space-x-2">
                                  {/* İkon gösterimi */}
                                  <p
                                    className={`font-medium text-gray-900 ${
                                      category.level > 0 ? "text-sm" : ""
                                    }`}
                                  >
                                    {category.name}
                                  </p>
                                </div>
                                {category.level === 0 ? (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Ana Kategori
                                  </span>
                                ) : category.level === 1 ? (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Alt Kategori
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Alt-Alt Kategori
                                  </span>
                                )}
                                {/* Sort Input */}
                                <div className="flex items-center space-x-2 ml-2">
                                  <span className="text-xs text-gray-500">
                                    Sıra:
                                  </span>
                                  <input
                                    type="number"
                                    value={category.sort || 0}
                                    onChange={(e) =>
                                      handleSortChange(
                                        category.id,
                                        e.target.value
                                      )
                                    }
                                    onBlur={() => handleSortBlur(category.id)}
                                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none"
                                    min="0"
                                    max="999"
                                    disabled={isReordering}
                                  />
                                </div>
                              </div>
                              <div
                                className={`flex items-center space-x-2 text-gray-600 ${
                                  category.level > 0 ? "text-xs" : "text-sm"
                                }`}
                              >
                                <span>🇲🇪 {category.name || "N/A"}</span>
                              </div>
                              {category.description && (
                                <p
                                  className={`text-gray-600 mt-1 ${
                                    category.level > 0 ? "text-xs" : "text-sm"
                                  }`}
                                >
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {category.products_count || 0} Ürün
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(category)}
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
                              onClick={() => openDeleteModal(category)}
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
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredItems.length === 0 && searchTerm.trim() && (
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Arama Sonucu Bulunamadı
              </h3>
              <p className="text-gray-600 mb-4">
                "{searchTerm}" için kategori bulunamadı.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2 mx-auto"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Aramayı Temizle</span>
              </button>
            </div>
          )}

          {!loading && items.length === 0 && !searchTerm.trim() && (
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Kategori Bulunamadı
              </h3>
              <p className="text-gray-600 mb-4">
                Henüz sistemde kategori bulunmuyor.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2 mx-auto"
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
                <span>İlk Kategoriyi Ekle</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Components */}
        <AddCategoryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCategory}
        />

        <EditCategoryModal
          isOpen={showEditModal}
          category={selectedCategory}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          onSave={handleEditCategory}
        />

        <DeleteCategoryModal
          isOpen={showDeleteModal}
          category={selectedCategory}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedCategory(null);
          }}
          onConfirm={handleDeleteCategory}
        />
      </div>
    </div>
  );
}
