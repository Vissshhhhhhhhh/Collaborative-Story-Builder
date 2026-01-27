import { Trash2 } from "lucide-react";

function DeleteChapterModal({ chapter, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Delete {chapter.isBranch ? "Branch" : "Chapter"}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          {chapter.isBranch
            ? "This branch will be permanently deleted."
            : "This chapter and all its branches will be permanently deleted."}
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md border"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            <Trash2 size={14} className="inline mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteChapterModal;
