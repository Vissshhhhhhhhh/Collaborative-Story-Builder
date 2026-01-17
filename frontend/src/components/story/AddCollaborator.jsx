import { useState } from "react";
import { addCollaborator } from "../../api/storyApi";

function AddCollaboratorModal({ storyId, onClose, storyTitle, onAdded }) {
  const [emailInputs, setEmailInputs] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleAddInput = () => {
    setEmailInputs((prev) => [...prev, ""]);
  };

  const handleChange = (index, value) => {
    setEmailInputs((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleInvite = async () => {
    const emailList = emailInputs
      .map((e) => e.trim())
      .filter(Boolean);

    if (emailList.length === 0) {
        setMsg("Please enter at least one email.");
      setTimeout(()=>{
        setMsg("");
      },3000);
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      for (let email of emailList) {
        await addCollaborator(storyId, email);
      }

      setMsg("Invitation(s) sent successfully.");
      onAdded?.();

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to invite collaborator(s)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-start">
           <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900">
                    Add Collaborator
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    {storyTitle}
                </p>
            </div>


            <div className="flex items-center gap-2">
                {/* ✅ Add Input Button */}
            <button
                onClick={handleAddInput}
                className="w-10 h-10 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center text-2xl font-semibold"
                title="Add another email"
            >
            +
            </button>



            {/* Close Button */}
            <button
                onClick={onClose}
                className="w-10 h-10 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center text-[18px] font-semibold"
                title="Close"
            >
            ✕
            </button>

          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {emailInputs.map((email, index) => (
            <input
              key={index}
              type="text"
              value={email}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder="Enter the email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"
            />
          ))}

          {msg && (
            <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              {msg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          {/* ✅ Invite button */}
          <button
            onClick={handleInvite}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {loading ? "Inviting..." : "Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCollaboratorModal;
