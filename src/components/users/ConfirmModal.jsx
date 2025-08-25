export default function ConfirmModal({
  isOpen,
  user,
  action,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !user || !action) return null;

  const isDeleteAction = action === "delete";
  const iconColor = isDeleteAction
    ? "bg-gradient-to-r from-red-500 to-red-600"
    : "bg-gradient-to-r from-orange-500 to-yellow-500";

  const bgColor = isDeleteAction
    ? "bg-red-50 border-red-500"
    : "bg-orange-50 border-orange-500";

  const textColor = isDeleteAction ? "text-red-600" : "text-orange-600";

  const buttonColor = isDeleteAction
    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
    : "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600";

  const getTitle = () => {
    return isDeleteAction ? "Kullanıcı Sil" : "Admin Durumu Değiştir";
  };

  const getWarningTitle = () => {
    return isDeleteAction
      ? "Dikkat! Bu işlem geri alınamaz."
      : "Admin durumu değiştirilecek.";
  };

  const getWarningText = () => {
    if (isDeleteAction) {
      return "Kullanıcı kalıcı olarak sistemden silinecek ve tüm verileri kaybolacak.";
    }
    return user.is_admin
      ? "Kullanıcının admin yetkileri kaldırılacak."
      : "Kullanıcıya admin yetkileri verilecek.";
  };

  const getButtonText = () => {
    return isDeleteAction ? "Sil" : "Değiştir";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColor}`}
            >
              {isDeleteAction ? (
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
              ) : (
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
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {getTitle()}
              </h3>
              <p className="text-gray-600 text-sm">
                {user.name} kullanıcısı için işlem onayı
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-gray-600 text-sm">{user.email}</p>
              <span
                className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                  user.is_admin
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {user.is_admin ? "👑 Admin" : "👤 Kullanıcı"}
              </span>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-l-4 ${bgColor}`}>
            <div className="flex items-center space-x-2">
              <svg
                className={`w-5 h-5 ${textColor}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <p
                  className={`font-semibold ${
                    isDeleteAction ? "text-red-800" : "text-orange-800"
                  }`}
                >
                  {getWarningTitle()}
                </p>
                <p
                  className={`text-sm ${
                    isDeleteAction ? "text-red-700" : "text-orange-700"
                  }`}
                >
                  {getWarningText()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200 flex items-center space-x-2"
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
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-lg transition duration-200 flex items-center space-x-2 ${buttonColor}`}
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{getButtonText()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

