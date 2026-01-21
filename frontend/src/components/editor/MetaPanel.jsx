import { useState } from "react";
import { lockChapter, unlockChapter } from "../../api/chapterApi";

function MetaPanel({ chapterDetails,onRefresh }) {
  const [lockLoading, setLockLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const createdBy = chapterDetails?.createdBy?.name || "-";
  const lastEditedBy = chapterDetails?.lastEditedBy?.name || "-";

  const isLocked = chapterDetails?.isLocked || false;
  const lockedBy = chapterDetails?.lockedBy?.name || "-";

  const handleLockToggle = async () => {
    if (!chapterDetails?._id) return;

    setLockLoading(true);
    setMsg("");

    try {
      if (isLocked) {
        await unlockChapter(chapterDetails._id);
        setMsg("Chapter unlocked ✅");
      } else {
        await lockChapter(chapterDetails._id);
        setMsg("Chapter locked ✅");
      }
      await onRefresh?.();
      setTimeout(() => setMsg(""), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Lock/Unlock failed");
    } finally {
      setLockLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <p className="text-sm font-semibold text-gray-900 mb-3">Chapter Info</p>

      <div className="space-y-2">
        <p className="text-sm text-gray-700">
          Created By: <span className="font-medium">{createdBy}</span>
        </p>

        <p className="text-sm text-gray-700">
          Last Edited By: <span className="font-medium">{lastEditedBy}</span>
        </p>

        <p className="text-sm text-gray-700">
          Status:{" "}
          <span className="font-medium">
            {isLocked ? "Locked" : "Unlocked"}
          </span>
        </p>

        {isLocked && (
          <p className="text-sm text-gray-700">
            Locked By: <span className="font-medium">{lockedBy}</span>
          </p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        

        {msg && (
          <p className="text-xs text-gray-500 mt-2 text-center">{msg}</p>
        )}
      </div>
    </div>
  );
}

export default MetaPanel;
