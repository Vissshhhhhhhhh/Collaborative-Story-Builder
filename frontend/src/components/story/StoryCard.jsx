import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import defaultImage from "../../assets/default-story.webp";
import { useAuth } from "../../context/AuthContext";

function StoryCard({
  story,
  source,
  mode = "main", // "main" | "dashboard"
  onPublishToggle,
  onAddCollaborator,
  onViewCollaborators,
  onDeleteStory,
  hideAddCollaborator = false,
  viewOnlyCollaborators = false,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const imageUrl =
    source === "internal"
      ? story?.coverImage || defaultImage
      : story?.formats?.["image/jpeg"] || defaultImage;

  const title = story?.title || "Untitled Story";

  // ✅ your backend returns: { userId, name, email }
  const loggedInUserId = user?.userId;

  // ✅ in your dashboard APIs, story.author is ObjectId (string), NOT populated
  const isAuthor =
    source === "internal" &&
    loggedInUserId &&
    story?.author &&
    story.author.toString() === loggedInUserId.toString();

  // ✅ truncate title
  const MAX_TITLE = 18;
  const displayTitle =
    title.length > MAX_TITLE ? title.slice(0, MAX_TITLE) + "....." : title;

  // ✅ Card click -> open editor
  const handleCardClick = () => {
    if (mode !== "dashboard") {
      navigate(
        `/reader/${source}/${source === "internal" ? story._id : story.id}`
      );
      return;
    }
    navigate(`/editor/${story._id}`);
  };

  // ✅ Close menu outside click + ESC
  useEffect(() => {
    function handleOutsideClick(e) {
      if (!openMenu) return;

      const clickedInsideMenu = menuRef.current?.contains(e.target);
      const clickedMenuButton = buttonRef.current?.contains(e.target);

      if (!clickedInsideMenu && !clickedMenuButton) {
        setOpenMenu(false);
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") setOpenMenu(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [openMenu]);

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow relative overflow-visible cursor-pointer"
    >
      {/* ✅ Mobile = image on top */}
      <div className="block md:hidden">
        <img
          src={imageUrl}
          alt="story-cover"
          onError={(e) => {
            e.currentTarget.src = defaultImage;
          }}
          className="w-full h-32 object-cover rounded-t-lg border-b border-gray-300"
        />

      </div>

      {/* ✅ Desktop = image header */}
        <div className="hidden md:block">
          <img
            src={imageUrl}
            alt="story-cover"
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
            className="w-full h-40 object-cover rounded-t-lg border-b border-gray-300"
          />
        </div>


      {/* ✅ Body = only title */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700">{displayTitle}</p>
        </div>

        {/* ✅ Menu button ONLY for author */}
        {mode === "dashboard" && isAuthor && (
          <div className="relative ml-4">
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu((prev) => !prev);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="More options"
            >
              ⋮
            </button>

            {openMenu && (
              <div
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-[999]"
              >
                <button
                  onClick={() => {
                    navigate(`/editor/${story._id}`);
                    setOpenMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 border-b border-gray-200 font-medium text-gray-800"
                >
                  Open in editor
                </button>

                {!hideAddCollaborator && (
                  <button
                  onClick={() => {
                    onAddCollaborator?.(story._id);
                    setOpenMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 border-b border-gray-200 font-medium text-gray-800"
                 >
                  Add a collaborator
                </button>
                )}
                

                <button
                  onClick={() => {
                    onViewCollaborators?.(story._id);
                    setOpenMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 border-b border-gray-200 font-medium text-gray-800"
                >
                  View collaborators
                  {!viewOnlyCollaborators && (
                    <span className="block text-xs text-gray-500 font-normal">
                    (remove inside)
                  </span>
                  )}
                  
                </button>

                <button
                  onClick={() => {
                    onPublishToggle?.(story._id);
                    setOpenMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 border-b border-gray-200 font-medium text-gray-800"
                >
                  {story?.isPublished ? "Unpublish" : "Publish"}
                </button>

                <button
                  onClick={() => {
                    onDeleteStory?.(story._id);
                    setOpenMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors duration-150 font-medium text-red-700"
                >
                  Delete the entire story
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryCard;
