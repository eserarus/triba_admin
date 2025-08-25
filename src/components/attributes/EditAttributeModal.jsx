import { useState, useEffect } from "react";
import api from "../../api/client";

const TYPES = [
  { value: "text", label: "Metin" },
  { value: "number", label: "Sayı" },
  { value: "select", label: "Seçmeli" },
  { value: "checkbox", label: "Çoklu Seçim" },
];

export default function EditAttributeModal({
  isOpen,
  attribute,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "text",
    is_required: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (attribute) {
      setFormData({
        name: attribute.name || "",
        code: attribute.code || "",
        type: attribute.type || "text",
        is_required: Boolean(attribute.is_required),
      });
    }
  }, [attribute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        type: formData.type,
        is_required: formData.is_required ? 1 : 0,
      };
      await onSave(attribute.id, payload);
      setFormData({
        name: "",
        code: "",
        type: "text",
        is_required: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      code: "",
      type: "text",
      is_required: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
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
                  Özellik Düzenle
                </h3>
                <p className="text-gray-600 text-sm">
                  "{attribute?.name}" özelliğini düzenleyin
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Özellik Adı <span className="text-red-500">*</span>
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
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 716.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                placeholder="Özellik adını girin"
                required
                maxLength={120}
              />
            </div>
          </div>

          {/* Code Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kod
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
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                placeholder="Örn: color, size, brand"
                maxLength={50}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Özellik için benzersiz kod adı (opsiyonel)
            </p>
          </div>

          {/* Type Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tip
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
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select ve Checkbox tipleri için değerler ayrıca tanımlanabilir
            </p>
          </div>

          {/* Required Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={formData.is_required}
              onChange={(e) =>
                setFormData({ ...formData, is_required: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="required"
              className="ml-2 block text-sm text-gray-900"
            >
              Zorunlu özellik
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition duration-200 disabled:opacity-50"
            >
              {isLoading ? "Güncelleniyor..." : "Güncelle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
