import { useState, useEffect } from "react";
import api from "../../api/client";

export default function AttributeValuesModal({ isOpen, attribute, onClose }) {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newValue, setNewValue] = useState({
    value_en: "",
    value_me: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && attribute?.id) {
      loadValues();
    }
  }, [isOpen, attribute?.id]);

  const loadValues = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/attributes/${attribute.id}/values`);
      setValues(res.data?.data || []);
    } catch (error) {
      console.error("Değerler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddValue = async (e) => {
    e.preventDefault();
    if (!newValue.value_en.trim() || !newValue.value_me.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/admin/attributes/${attribute.id}/values`, newValue);
      setNewValue({ value_en: "", value_me: "" });
      setShowAddForm(false);
      await loadValues();
    } catch (error) {
      console.error("Değer eklenirken hata:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteValue = async (valueId) => {
    if (!confirm("Bu değeri silmek istediğinizden emin misiniz?")) return;

    try {
      await api.delete(`/admin/attribute-values/${valueId}`);
      await loadValues();
    } catch (error) {
      console.error("Değer silinirken hata:", error);
    }
  };

  const handleClose = () => {
    setShowAddForm(false);
    setNewValue({ value_en: "", value_me: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
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
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Özellik Değerleri
                </h3>
                <p className="text-gray-600 text-sm">
                  "{attribute?.name_en}" için mevcut değerler
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

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Add New Value Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
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
              <span>Yeni Değer Ekle</span>
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-gray-900 mb-4">
                Yeni Değer Ekle
              </h4>
              <form onSubmit={handleAddValue} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İngilizce Değer <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newValue.value_en}
                      onChange={(e) =>
                        setNewValue({ ...newValue, value_en: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition duration-200"
                      placeholder="English value"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Karadağca Değer <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newValue.value_me}
                      onChange={(e) =>
                        setNewValue({ ...newValue, value_me: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition duration-200"
                      placeholder="Crnogorska vrijednost"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewValue({ value_en: "", value_me: "" });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !newValue.value_en.trim() ||
                      !newValue.value_me.trim()
                    }
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-200 disabled:opacity-50"
                  >
                    {isSubmitting ? "Ekleniyor..." : "Ekle"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Values List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Yükleniyor...</span>
            </div>
          ) : values.length === 0 ? (
            <div className="text-center py-8">
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
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Henüz Değer Yok
              </h4>
              <p className="text-gray-600">
                Bu özellik için henüz değer tanımlanmamış.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 mb-4">
                Mevcut Değerler ({values.length})
              </h4>
              {values.map((value) => (
                <div
                  key={value.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-150"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            EN
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {value.value_en}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                            ME
                          </span>
                          <span className="text-sm text-gray-600">
                            {value.value_me}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteValue(value.id)}
                    className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition duration-200"
                    title="Değeri Sil"
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
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Toplam {values.length} değer tanımlanmış
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
