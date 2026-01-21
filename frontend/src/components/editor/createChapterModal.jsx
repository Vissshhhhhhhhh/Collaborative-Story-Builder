import { useState } from "react";

function CreateChapterModal({
  titleText = "Create Chapter",
  placeholder = "Enter chapter title",
  onClose,
  onCreate,
}) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await onCreate(trimmed);
      setTitle("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {titleText}
          </h2>

          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 text-xl font-semibold"
            title="Close"
          >
            ✕
          </button>
        </div>

        <form
          className="p-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default CreateChapterModal;
