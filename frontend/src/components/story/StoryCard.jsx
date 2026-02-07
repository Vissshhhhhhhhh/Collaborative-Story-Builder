import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import defaultImage from "../../assets/default-story.webp";
import { useAuth } from "../../context/AuthContext";
import { Download } from "lucide-react";
import { downloadStoryPDF } from "../../api/storyApi";

function StoryCard({
  story,
  source,
  mode = "main", // "main" | "dashboard"
  onPublishToggle,
  onAddCollaborator,
  onViewCollaborators,
  onDeleteStory,
  onEditStory,
  hideAddCollaborator = false,
  viewOnlyCollaborators = false,
  isPublishedSection = false,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const imageUrl =
    source === "internal"
      ? story.coverImage?.url || defaultImage
      : story?.formats?.["image/jpeg"] || defaultImage;

  const title = story?.title || "Untitled Story";

  const loggedInUserId = user?.userId;

  const isAuthor =
    source === "internal" &&
    loggedInUserId &&
    story?.author &&
    story.author.toString() === loggedInUserId.toString();

  const handleCardClick = () => {
    if (mode !== "dashboard") {
      navigate(
        `/reader/${source}/${source === "internal" ? story._id : story.id}`,
      );
      return;
    }
    navigate(`/editor/${story._id}`);
  };

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

  const handleDownloadPDF = async (e) => {
    e.stopPropagation();

    try {
      const res = await downloadStoryPDF(story._id);

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${story.title}.pdf`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed", err);
      alert("Failed to download PDF");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow relative overflow-visible md:h-[170px] flex flex-col">
      {/* ✅ Image fixed height (desktop smaller) */}
      <div
        className="h-[140px] md:h-[120px] w-full cursor-pointer relative z-10"
        onClick={handleCardClick}
      >

        {/* ✅ Mobile */}
        <div className="block md:hidden h-full">
          <img
            src={imageUrl}
            alt="story-cover"
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
            className="w-full h-full object-cover rounded-t-lg border-b border-gray-300"
          />
        </div>

        {/* ✅ Desktop */}
        <div className="hidden md:block h-full">
          <img
            src={imageUrl}
            alt="story-cover"
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
            className="w-full h-full object-cover rounded-t-lg border-b border-gray-300"
          />
        </div>
        {/* ✅ PDF Download (Explore only) */}
        
      </div>

      {/* ✅ Bottom section SMALLER in desktop */}
      <div className="px-3 py-2 md:py-0 flex items-center gap-2 md:h-12 flex-1">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700 line-clamp-1 leading-4">
            {title}
          </p>
        </div>

        <div className="relative w-10 flex justify-end z-50 pointer-events-auto">
          {/* Download button (Explore / Main only) */}
          {mode === "main" && source === "internal" && (
            <button
              onClick={handleDownloadPDF}
              title="Download as PDF"
              className="
               p-2 rounded-lg
                hover:bg-gray-100
                transition
              "
            >
              <Download size={16} className="text-gray-700" />
            </button>
          )}

          {mode !== "main" && isAuthor ? (
            <>
              
              <button
                ref={buttonRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu((prev) => !prev);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors z-50 pointer-events-auto"
              >

                ⋮
              </button>

              {openMenu && (
                <div
                  ref={menuRef}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
                >
                  {!isPublishedSection && (
                    <>
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
                    </>
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

                  {!isPublishedSection && (
                    <button
                      onClick={() => {
                        onEditStory?.(story); // ✅ send full story object
                        setOpenMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-150 border-b border-gray-200 font-medium text-gray-800"
                    >
                      Edit story details
                      <span className="block text-xs text-gray-500 font-normal">
                        (title / cover image)
                      </span>
                    </button>
                  )}

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
            </>
          ) : (
            <div className="w-10 h-10 opacity-0 select-none">⋮</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoryCard;