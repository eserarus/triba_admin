import { useState, useEffect } from "react";
import api from "../../api/client";

// Kategorileri hiyerarşik olarak organize eden fonksiyon
function createHierarchicalOptions(categories, excludeId = null) {
  const options = [];

  const addCategoryOptions = (category, level = 0) => {
    // Exclude edilecek kategoriyi ve onun tüm alt kategorilerini atla
    if (
      excludeId &&
      (category.id === excludeId ||
        isDescendantOf(category, excludeId, categories))
    ) {
      return;
    }

    const prefix = "──".repeat(level);
    options.push({
      id: category.id,
      label: `${prefix}${level > 0 ? " " : ""}${category.name_en} / ${
        category.name_me
      }`,
      level: level,
    });

    // Bu kategorinin alt kategorilerini bul ve ekle
    const children = categories.filter((cat) => cat.parent_id === category.id);
    children.forEach((child) => {
      addCategoryOptions(child, level + 1);
    });
  };

  // Ana kategorilerden başla
  const rootCategories = categories.filter((cat) => !cat.parent_id);
  rootCategories.forEach((root) => {
    addCategoryOptions(root, 0);
  });

  return options;
}

// Bir kategorinin başka bir kategorinin alt kategorisi olup olmadığını kontrol eder
function isDescendantOf(category, ancestorId, categories) {
  if (!category.parent_id) return false;
  if (category.parent_id === ancestorId) return true;

  const parent = categories.find((cat) => cat.id === category.parent_id);
  if (!parent) return false;

  return isDescendantOf(parent, ancestorId, categories);
}

export default function EditCategoryModal({
  isOpen,
  category,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    name_en: "",
    name_me: "",
    parent_id: "",
    icon: "",
    color: "#3B82F6",
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name_en: category.name_en || "",
        name_me: category.name_me || "",
        parent_id: category.parent_id ? String(category.parent_id) : "",
        icon: category.icon || "",
        color: category.color || "#3B82F6",
      });
    }
  }, [category]);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      // Tüm kategorileri yükle (kendisi hariç)
      const res = await api.get("/admin/categories");
      const allCategories = res.data?.data || [];

      // Kendisini listeden çıkar (kendi kendisine parent olamaz)
      setCategories(allCategories.filter((cat) => cat.id !== category?.id));
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name_en.trim() || !formData.name_me.trim()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name_en: "",
      name_me: "",
      parent_id: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Kategori Düzenle
                </h3>
                <p className="text-gray-600 text-sm">
                  {category?.name_en} / {category?.name_me} kategorisini
                  güncelle
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition duration-200"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Parent Category Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Üst Kategori
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
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
              <select
                value={formData.parent_id}
                onChange={(e) =>
                  setFormData({ ...formData, parent_id: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              >
                <option value="">Ana kategori (üst kategori yok)</option>
                {createHierarchicalOptions(categories, category?.id).map(
                  (option) => (
                    <option key={option.id} value={String(option.id)}>
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Boş bırakırsanız ana kategori olur, seçerseniz alt kategori olur
            </p>
          </div>

          {/* English Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İngilizce Adı <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) =>
                  setFormData({ ...formData, name_en: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                placeholder="English category name"
                required
              />
            </div>
          </div>

          {/* Montenegrin Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Karadağca Adı <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={formData.name_me}
                onChange={(e) =>
                  setFormData({ ...formData, name_me: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                placeholder="Crnogorski naziv kategorije"
                required
              />
            </div>
          </div>

          {/* Icon Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İkon Adı
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m4 0v2a1 1 0 01-1 1h-1m-6 0h6m-6 0v16a1 1 0 01-1 1H9a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                placeholder="Örn: phone, home, user (PNG dosya adı)"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              PNG dosya adını girin (örn: phone, home, user). Dosya storage/
              klasöründe olmalı.
            </p>
          </div>

          {/* Icon Color Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İkon Rengi
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                placeholder="#3B82F6"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Hex renk kodu girin (örn: #3B82F6)
            </p>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200 flex items-center space-x-2 disabled:opacity-50"
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
              <span>İptal</span>
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                !formData.name_en.trim() ||
                !formData.name_me.trim()
              }
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <svg
                  className="w-4 h-4 animate-spin"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              <span>{isLoading ? "Güncelleniyor..." : "Güncelle"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
