import { useState } from "react";

export default function DeleteAttributeModal({
  isOpen,
  attribute,
  onClose,
  onDelete,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(attribute.id);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Özelliği Sil
              </h3>
              <p className="text-gray-600 text-sm">Bu işlem geri alınamaz</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-red-600"
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
              <div>
                <h4 className="font-medium text-red-800">
                  "{attribute?.name_en} / {attribute?.name_me}" özelliğini
                  silmek istediğinizden emin misiniz?
                </h4>
                <p className="text-red-600 text-sm mt-1">
                  Bu özellik kalıcı olarak silinecek ve bu işlem geri
                  alınamayacak.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Özellik Adı (EN):
                </span>
                <span className="text-sm text-gray-900">
                  {attribute?.name_en}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Özellik Adı (ME):
                </span>
                <span className="text-sm text-gray-900">
                  {attribute?.name_me}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Tip:</span>
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    attribute?.type === "text"
                      ? "bg-blue-100 text-blue-800"
                      : attribute?.type === "number"
                      ? "bg-green-100 text-green-800"
                      : attribute?.type === "select"
                      ? "bg-purple-100 text-purple-800"
                      : attribute?.type === "checkbox"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {attribute?.type === "text"
                    ? "Metin"
                    : attribute?.type === "number"
                    ? "Sayı"
                    : attribute?.type === "select"
                    ? "Seçmeli"
                    : attribute?.type === "checkbox"
                    ? "Çoklu Seçim"
                    : attribute?.type}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Zorunlu:
                </span>
                <span className="text-sm">
                  {attribute?.is_required ? (
                    <span className="text-red-600 font-medium">Evet</span>
                  ) : (
                    <span className="text-gray-400">Hayır</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200"
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition duration-200 disabled:opacity-50"
            >
              {isLoading ? "Siliniyor..." : "Evet, Sil"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
