import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../store/auth";
import { CategoryAttributeModal } from "../components/categoryAttributes";

export default function CategoryAttributes() {
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErr("");
    try {
      const [categoriesRes, attributesRes] = await Promise.all([
        api.get("/admin/categories"),
        api.get("/admin/attributes"),
      ]);

      setCategories(categoriesRes.data?.data || []);
      setAttributes(attributesRes.data?.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error?.message || "Veriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryAttributes = async (categoryId) => {
    try {
      const res = await api.get(`/admin/categories/${categoryId}/attributes`);
      console.log("Category Attributes Response:", res.data);
      setCategoryAttributes(res.data?.data || []);
    } catch (error) {
      console.error("Kategori özellikleri yüklenirken hata:", error);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    loadCategoryAttributes(category.id);
  };

  const handleSaveAttribute = async (formData) => {
    try {
      if (editingAttribute) {
        // Update existing pivot
        await api.patch(
          `/admin/category-attributes/${editingAttribute.id}`,
          formData
        );
      } else {
        // Create new pivot
        await api.post(
          `/admin/categories/${selectedCategory.id}/attributes`,
          formData
        );
      }
      await loadCategoryAttributes(selectedCategory.id);
      setShowModal(false);
      setEditingAttribute(null);
    } catch (error) {
      console.error("Özellik kaydedilirken hata:", error);
      throw error;
    }
  };

  const handleDeleteAttribute = async (pivotId) => {
    if (
      !confirm("Bu özelliği kategoriden kaldırmak istediğinizden emin misiniz?")
    )
      return;

    try {
      // API route: DELETE /admin/categories/{categoryId}/attributes/{attributeId}
      // Pivot ID'den attribute ID'yi bulalım
      const categoryAttribute = categoryAttributes.find(
        (ca) => ca.id === pivotId
      );
      if (categoryAttribute) {
        await api.delete(
          `/admin/categories/${selectedCategory.id}/attributes/${
            categoryAttribute.pivot?.attribute_id ||
            categoryAttribute.attribute_id
          }`
        );
        await loadCategoryAttributes(selectedCategory.id);
      }
    } catch (error) {
      console.error("Özellik kaldırılırken hata:", error);
    }
  };

  const openModal = (attribute = null) => {
    setEditingAttribute(attribute);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAttribute(null);
  };

  // Hiyerarşik kategori listesi oluştur
  const createHierarchicalCategories = (categories) => {
    const organized = [];

    const addCategoryAndChildren = (category, level = 0) => {
      const prefix = "──".repeat(level);
      organized.push({
        ...category,
        level: level,
        displayName: `${prefix}${level > 0 ? " " : ""}${category.name}`,
      });

      const children = categories.filter(
        (cat) => cat.parent_id === category.id
      );
      children.forEach((child) => {
        addCategoryAndChildren(child, level + 1);
      });
    };

    const rootCategories = categories.filter((cat) => !cat.parent_id);
    rootCategories.forEach((root) => {
      addCategoryAndChildren(root, 0);
    });

    return organized;
  };

  // Arama filtresi
  const filteredCategories = createHierarchicalCategories(categories).filter(
    (cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
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
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  🔗 Kategori-Özellik Eşleştirme
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
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length}
              </p>
              <p className="text-gray-600 text-sm">Toplam Kategori</p>
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
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {attributes.length}
              </p>
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
                {categoryAttributes.length}
              </p>
              <p className="text-gray-600 text-sm">Atanmış Özellik</p>
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {selectedCategory ? "Seçili" : "Seçilmedi"}
              </p>
              <p className="text-gray-600 text-sm">Kategori Durumu</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kategori Seçimi */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📂 Kategori Seçimi
              </h2>

              {/* Arama */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-200"
                />
              </div>

              {/* Kategori Listesi */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Yükleniyor...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full text-left p-3 rounded-lg border transition duration-200 ${
                        selectedCategory?.id === category.id
                          ? "bg-green-50 border-green-300 text-green-800"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            selectedCategory?.id === category.id
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {category.displayName}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Özellik Yönetimi */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {selectedCategory ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        ⚙️ {selectedCategory.name}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Bu kategoriye atanmış özellikler
                      </p>
                    </div>
                    <button
                      onClick={() => openModal(null)}
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
                      <span>Özellik Ekle</span>
                    </button>
                  </div>

                  {/* Özellik Listesi */}
                  {categoryAttributes.length === 0 ? (
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
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Henüz Özellik Atanmamış
                      </h4>
                      <p className="text-gray-600">
                        Bu kategoriye özellik atamak için yukarıdaki butonu
                        kullanın.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categoryAttributes.map((ca) => {
                        console.log("Category Attribute Item:", ca);
                        return (
                          <div
                            key={ca.id}
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-150"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-medium text-gray-900">
                                    {ca.attribute?.name || ca.name}
                                  </h4>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        (ca.attribute?.type || ca.type) ===
                                        "text"
                                          ? "bg-blue-100 text-blue-800"
                                          : (ca.attribute?.type || ca.type) ===
                                            "number"
                                          ? "bg-green-100 text-green-800"
                                          : (ca.attribute?.type || ca.type) ===
                                            "select"
                                          ? "bg-purple-100 text-purple-800"
                                          : (ca.attribute?.type || ca.type) ===
                                            "checkbox"
                                          ? "bg-orange-100 text-orange-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {(ca.attribute?.type || ca.type) ===
                                      "text"
                                        ? "Metin"
                                        : (ca.attribute?.type || ca.type) ===
                                          "number"
                                        ? "Sayı"
                                        : (ca.attribute?.type || ca.type) ===
                                          "select"
                                        ? "Seçmeli"
                                        : (ca.attribute?.type || ca.type) ===
                                          "checkbox"
                                        ? "Çoklu Seçim"
                                        : ca.attribute?.type || ca.type}
                                    </span>
                                    {(ca.attribute?.code || ca.code) && (
                                      <span className="inline-flex px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded">
                                        Kod: {ca.attribute?.code || ca.code}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={ca.is_required}
                                      disabled
                                      className="h-4 w-4 text-green-600"
                                    />
                                    <span className="text-gray-700">
                                      Zorunlu
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={ca.show_in_filter}
                                      disabled
                                      className="h-4 w-4 text-blue-600"
                                    />
                                    <span className="text-gray-700">
                                      Filtrede Göster
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={ca.unique_per_listing}
                                      disabled
                                      className="h-4 w-4 text-purple-600"
                                    />
                                    <span className="text-gray-700">
                                      Liste Başına Tek
                                    </span>
                                  </div>
                                  <div className="text-gray-700 font-medium">
                                    Sıra: {ca.sort_order || 0}
                                  </div>
                                  <div className="text-gray-700 font-medium">
                                    Kod: {ca.attribute?.code || ca.code || "-"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                <button
                                  onClick={() => openModal(ca)}
                                  className="text-blue-600 hover:text-blue-800 transition duration-150"
                                >
                                  Düzenle
                                </button>
                                <button
                                  onClick={() => handleDeleteAttribute(ca.id)}
                                  className="text-red-600 hover:text-red-800 transition duration-150"
                                >
                                  Kaldır
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
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
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Kategori Seçin
                  </h4>
                  <p className="text-gray-600">
                    Sol taraftan bir kategori seçerek özellik yönetimini
                    başlatın.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <CategoryAttributeModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={handleSaveAttribute}
          attributes={attributes}
          selectedCategory={selectedCategory}
          editingAttribute={editingAttribute}
        />
      </div>
    </div>
  );
}
