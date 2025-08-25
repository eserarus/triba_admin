import { useState, useEffect } from "react";

export default function CategoryAttributeModal({
  isOpen,
  onClose,
  onSave,
  attributes,
  selectedCategory,
  editingAttribute = null,
}) {
  const [formData, setFormData] = useState({
    attribute_id: "",
    is_required: false,
    show_in_filter: false,
    unique_per_listing: false,
    sort_order: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Editing Attribute:", editingAttribute);
    if (editingAttribute) {
      const newFormData = {
        pivotId: editingAttribute.id,
        attribute_id: String(
          editingAttribute.pivot?.attribute_id || editingAttribute.attribute_id
        ),
        is_required:
          editingAttribute.pivot?.is_required || editingAttribute.is_required,
        show_in_filter:
          editingAttribute.pivot?.show_in_filter ||
          editingAttribute.show_in_filter,
        unique_per_listing:
          editingAttribute.pivot?.unique_per_listing ||
          editingAttribute.unique_per_listing,
        sort_order:
          editingAttribute.pivot?.sort_order || editingAttribute.sort_order,
      };
      console.log("Setting Form Data:", newFormData);
      setFormData(newFormData);
    } else {
      setFormData({
        attribute_id: "",
        is_required: false,
        show_in_filter: false,
        unique_per_listing: false,
        sort_order: 0,
      });
    }
  }, [editingAttribute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.attribute_id) return;

    setIsLoading(true);
    try {
      const payload = {
        attribute_id: Number(formData.attribute_id),
        is_required: formData.is_required ? 1 : 0,
        show_in_filter: formData.show_in_filter ? 1 : 0,
        unique_per_listing: formData.unique_per_listing ? 1 : 0,
        sort_order: Number(formData.sort_order),
      };

      if (editingAttribute) {
        payload.pivotId = editingAttribute.id;
      }

      await onSave(payload);
      setFormData({
        attribute_id: "",
        is_required: false,
        show_in_filter: false,
        unique_per_listing: false,
        sort_order: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      attribute_id: "",
      is_required: false,
      show_in_filter: false,
      unique_per_listing: false,
      sort_order: 0,
    });
    setSearchTerm("");
    onClose();
  };

  // Arama filtresi
  const filteredAttributes = attributes.filter((attr) =>
    attr.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Current Form Data:", formData);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
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
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingAttribute ? "Özellik Düzenle" : "Özellik Ekle"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {selectedCategory?.name} kategorisine
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
          {/* Özellik Seçimi */}
          {!editingAttribute ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Özellik Seçimi <span className="text-red-500">*</span>
              </label>

              {/* Arama */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Özellik ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-200"
                />
              </div>

              {/* Özellik Listesi */}
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                {filteredAttributes.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Özellik bulunamadı
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredAttributes.map((attr) => (
                      <label
                        key={attr.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition duration-150 ${
                          formData.attribute_id === String(attr.id)
                            ? "bg-green-50 border border-green-300"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="attribute_id"
                          value={attr.id}
                          checked={formData.attribute_id === String(attr.id)}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              attribute_id: e.target.value,
                            })
                          }
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {attr.name}
                            </span>
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
                          </div>
                          {attr.code && (
                            <p className="text-xs text-gray-500 mt-1">
                              Kod: {attr.code}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Özellik
              </label>
              <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
                <div className="font-medium text-gray-900">
                  {
                    attributes.find(
                      (attr) => attr.id === Number(formData.attribute_id)
                    )?.name
                  }
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>
                    Tip:{" "}
                    {
                      attributes.find(
                        (attr) => attr.id === Number(formData.attribute_id)
                      )?.type
                    }
                  </div>
                  {attributes.find(
                    (attr) => attr.id === Number(formData.attribute_id)
                  )?.code && (
                    <div>
                      Kod:{" "}
                      {
                        attributes.find(
                          (attr) => attr.id === Number(formData.attribute_id)
                        )?.code
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Kategoriye Özel Ayarlar */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              Kategoriye Özel Ayarlar
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Zorunlu */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={formData.is_required}
                  onChange={(e) =>
                    setFormData({ ...formData, is_required: e.target.checked })
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="is_required" className="text-sm text-gray-700">
                  Zorunlu özellik
                </label>
              </div>

              {/* Filtrede Göster */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="show_in_filter"
                  checked={formData.show_in_filter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      show_in_filter: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="show_in_filter"
                  className="text-sm text-gray-700"
                >
                  Filtrede göster
                </label>
              </div>

              {/* Liste Başına Tek */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="unique_per_listing"
                  checked={formData.unique_per_listing}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unique_per_listing: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="unique_per_listing"
                  className="text-sm text-gray-700"
                >
                  Liste başına tek
                </label>
              </div>

              {/* Sıra */}
              <div>
                <label
                  htmlFor="sort_order"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Sıra
                </label>
                <input
                  type="number"
                  id="sort_order"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition duration-200"
                  min="0"
                  max="999"
                />
              </div>
            </div>
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
              disabled={isLoading || !formData.attribute_id}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200 disabled:opacity-50"
            >
              {isLoading
                ? editingAttribute
                  ? "Güncelleniyor..."
                  : "Ekleniyor..."
                : editingAttribute
                ? "Güncelle"
                : "Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
