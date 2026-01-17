import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getChapterContent, saveChapterContent } from "../../api/chapterApi";

function TextEditor({ selectedChapter, setChapterDetails}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadContent() {
      if (!selectedChapter?._id) return;

      setLoading(true);
      setMsg("");

      try {
        const res = await getChapterContent(selectedChapter._id);
        setContent(res.data.chapter?.content || "");
        setChapterDetails?.(res.data.chapter || null);
      } catch (err) {
        console.error(err.response?.data || err.message);
        setMsg("Failed to load chapter content");
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [selectedChapter?._id]);

  const handleSave = async () => {
    if (!selectedChapter?._id) return;

    setMsg("Saving...");

    try {
      await saveChapterContent(selectedChapter._id, content);
      // reload details after save (so lastEditedBy updates)
      const refreshed = await getChapterContent(selectedChapter._id);
      setChapterDetails?.(refreshed.data.chapter || null);

      setMsg("Saved successfully ✅");
      setTimeout(() => setMsg(""), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Save failed");
    }
  };

  if (!selectedChapter?._id) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 max-w-lg text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Create your first chapter ✍️
        </h2>
        <p className="text-gray-600 mt-2">
          Start writing your story by creating a chapter from the sidebar.
        </p>

        <p className="text-sm text-gray-500 mt-4">
          Tip: Hover a chapter to add branches like VS Code.
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Top small bar inside editor */}
      <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-700 font-medium">
          {selectedChapter?.title || "No chapter selected"}
        </p>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition text-sm"
        >
          Save
        </button>
      </div>

      {/* Editor Area */}
      <div className="h-[calc(100vh-10.5rem)] p-3">
        {loading ? (
          <div className="text-gray-500 text-sm">Loading editor...</div>
        ) : (
          <ReactQuill
            value={content}
            onChange={setContent}
            className="h-full"
          />
        )}
      </div>

      {/* Message */}
      {msg && (
        <div className="px-4 py-2 border-t border-gray-200 text-sm text-gray-600">
          {msg}
        </div>
      )}
    </div>
  );
}

export default TextEditor;
