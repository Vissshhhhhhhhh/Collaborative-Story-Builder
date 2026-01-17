import { useEffect, useState } from "react";
import { getCollaborators, removeCollaborator } from "../../api/storyApi";
import { useAuth } from "../../context/AuthContext";

function CollaboratorsModal({ storyId, storyTitle,onClose, viewOnly = false }) {
  const { user } = useAuth();

  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const loggedInUserId = user?.userId;

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const res = await getCollaborators(storyId);
      setCollaborators(res.data.collaborators || []);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to load collaborators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [storyId]);

  const handleRemove = async (collaboratorId) => {
    try {
      await removeCollaborator(storyId, collaboratorId);
      setMsg("Collaborator removed successfully.");
      fetchCollaborators();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to remove collaborator");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900">
                Add Collaborator
            </h2>

            <p className="text-sm text-gray-500 mt-1">
                {storyTitle}
            </p>
          </div>


            <button
                onClick={onClose}
                className="w-10 h-10 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center text-2xl font-semibold"
                title="Close"
            >
            ✕
            </button>

        </div>

        {/* Body */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-6 text-gray-500">Loading...</div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No collaborators found.
            </div>
          ) : (
            <div className="space-y-3">
              {collaborators.map((c) => {
                const isAuthor = c._id?.toString() === loggedInUserId?.toString();

                return (
                  <div
                    key={c._id}
                    className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                    </div>

                    {/* ✅ Author tag / Remove button */}
                    {isAuthor ? (
                        <span className="text-sm font-semibold text-gray-600">Author</span>
                        ) : viewOnly ? (
                        <span className="text-sm font-medium text-gray-500">Collaborator</span>
                        ) : (
                        <button
                            onClick={() => handleRemove(c._id)}
                            className="px-3 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50 transition-colors text-sm"
                        >
                            Remove
                        </button>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {msg && (
            <div className="mt-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              {msg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CollaboratorsModal;
