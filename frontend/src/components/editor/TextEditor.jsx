import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { getChapterContent, saveChapterContent,lockChapter, unlockChapter } from "../../api/chapterApi";
import { useRef } from "react";
import { useAuth } from "../../context/AuthContext";

function TextEditor({ selectedChapter, setChapterDetails, sidebarLoaded, chapterDetails}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const { user } = useAuth();
  const prevChapterIdRef = useRef(null);

  const isLockedByOther =
  chapterDetails?.isLocked &&
  chapterDetails?.lockedBy &&
  chapterDetails.lockedBy._id?.toString() !== user?.userId?.toString();

  
  useEffect(() => {
    if (!selectedChapter?._id) return;

    const interval = setInterval(async () => {
      try {
        const res = await getChapterContent(selectedChapter._id);
        setChapterDetails?.(res.data.chapter || null);
      } catch {}
    }, 2000);


    return () => clearInterval(interval);
  }, [selectedChapter?._id]);

  useEffect(() => {
    if (!selectedChapter?._id) return;

     const heartbeat = setInterval(async ()=>{
      try{
        await lockChapter(selectedChapter._id);
      }
      catch{
        // console.log(`Chapter: ${chapterDetails?.title} locking mechanism failed...`);
      }
    },30000);

    return () => clearInterval(heartbeat);
  }, [selectedChapter?._id]);


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

  useEffect(() => {
    const currentId = selectedChapter?._id;
    const prevId = prevChapterIdRef.current;

    async function handleSwitchLock() {
      try {
        // ✅ unlock previous chapter if exists
        if (prevId && prevId !== currentId) {
          await unlockChapter(prevId);
        }

        // ✅ lock current chapter
        if (currentId && !isLockedByOther) {
          await lockChapter(currentId);
        }

        // ✅ refresh meta after lock
        if (currentId) {
          const res = await getChapterContent(currentId);
          setChapterDetails?.(res.data.chapter || null);
        }
      } catch (err) {
        // If someone else locked, we just show meta (polling will update)
        // Don't crash UI
        console.log(err.response?.data || err.message);
      }
    }

    handleSwitchLock();

    prevChapterIdRef.current = currentId;
  }, [selectedChapter?._id],isLockedByOther);

  useEffect(() => {
    const chapterId = selectedChapter?._id;
    if (!chapterId) return;

    const handleUnload = async () => {
      try {
        await unlockChapter(chapterId);
      } catch {}
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);

      // ✅ also unlock when component unmounts / user navigates away
      handleUnload();
    };
  }, [selectedChapter?._id]);


    const handleSave = async () => {
      if (!selectedChapter?._id) return;

      if (isLockedByOther) {
        setMsg("This chapter is locked. You can only view it.");
        return;
      }

      setMsg("Saving...");

      try {
        await saveChapterContent(selectedChapter._id, content);

        const refreshed = await getChapterContent(selectedChapter._id);
        setChapterDetails?.(refreshed.data.chapter || null);

        setMsg("Saved successfully ✅");
        setTimeout(() => setMsg(""), 1500);
      } catch (err) {
        setMsg(err.response?.data?.message || "Save failed");
      }
    };




    if (!sidebarLoaded) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500 text-sm">Loading editor...</p>
        </div>
      );
    }

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
          disabled={isLockedByOther}
          className={`px-4 py-2 rounded-md transition text-sm ${
                      isLockedByOther
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
        >
          Save
        </button>
      </div>

      {/* Editor Area */}
      <div className="h-[calc(100vh-10.5rem)] p-3">
        {loading ? (
          <div className="text-gray-500 text-sm">Loading editor...</div>
        ) : (
          <div className="h-[calc(100vh-16rem)] overflow-hidden border border-gray-200 rounded-md">
            <ReactQuill
              value={content}
              onChange={(val)=>{
                if(isLockedByOther) return;
                setContent(val);
              }}
              readOnly={isLockedByOther}
              theme="snow"
              className="h-full"
            />
          </div>

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
