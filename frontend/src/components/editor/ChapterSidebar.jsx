import { useEffect, useState } from "react";
import { getChapterSidebar, createChapter,deleteChapter} from "../../api/chapterApi";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  Unlock,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import CreateChapterModal from "./CreateChapterModal";
import { socket } from "../../socket";
import { useRef } from "react";
import RenameChapterModal from "./RenameChapterModal";
import DeleteChapterModal from "./DeleteChapterModal";
import { useAuth } from "../../context/AuthContext";

function ChapterSidebar({
  storyId,
  storyTitle = "Story",
  selectedChapter,
  setSelectedChapter,
  sidebarOpen,
  setSidebarOpen,
  collapsed,
  setCollapsed,
  onChaptersLoaded,
  reloadKey,
  canEdit,
}) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  // ✅ Modals
  const [openCreateChapter, setOpenCreateChapter] = useState(false);
  const [openCreateBranch, setOpenCreateBranch] = useState(false);
  const [branchParent, setBranchParent] = useState(null);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  //rename state
  const [openRenameModal, setOpenRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);

  //delete state
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  //from Authcontext
  const { user } = useAuth();
  const currentUserId =
    user?._id ||
    user?.id ||
    user?.userId ||
    user?.sub ||
    null;

  //helper fucntion
  const canShowActionMenu = (item) => {
    if (!canEdit) return false;
    if (!item.isLocked) return true;
    if (!item.lockedBy?._id) return false;
    if (!currentUserId) return false;

    return String(item.lockedBy._id) === String(currentUserId);
  };


  //ref
  const actionMenuRef = useRef(null);
  //ref useEffect
  useEffect(() => {
    function handleOutside(e) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setOpenActionMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  //socket functions
  useEffect(() => {
    const onLockUpdated = ({ chapterId, chapter }) => {
      setChapters((prev) =>
        prev.map((c) => {
          if (c._id !== chapterId) return c;
          return {
            ...c,
            ...chapter,
            lockedBy: chapter.lockedBy
              ? typeof chapter.lockedBy === "object"
                ? chapter.lockedBy
                : c.lockedBy
              : null,
          };
        }),
      );
    };

    socket.on("chapter:lockUpdated", onLockUpdated);

    return () => {
      socket.off("chapter:lockUpdated", onLockUpdated);
    };
  }, []);

  const loadSidebar = async () => {
    try {
      setLoading(true);
      const res = await getChapterSidebar(storyId);
      const list = res.data.chapters || [];
      setChapters(list);
      onChaptersLoaded?.(list);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSidebar();
  }, [storyId]);

  useEffect(() => {
    if (!storyId) return;
    loadSidebar();
  }, [reloadKey]);

  // ✅ For indentation: group branches under parent
  const normalChapters = chapters.filter((c) => !c.isBranch);
  const branches = chapters.filter((c) => c.isBranch);

  const getBranchesOf = (parentId) =>
    branches.filter((b) => b.parentChapter?.toString() === parentId.toString());

  return (
    <div className="h-full flex flex-col relative">
      {/* ✅ Mobile header */}
      <div className="md:hidden sticky top-0 bg-white z-10 flex items-center justify-between px-3 py-3 border-b border-gray-200">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 wrap-break-word">
            {storyTitle}
          </h3>
          <p className="text-xs text-gray-500">Chapter List</p>
        </div>

        <div className="flex items-center gap-2">
          {!collapsed && (
            <button
              className="p-2 rounded-md hover:bg-gray-100 transition-colors text-2xl font-semibold"
              title="Create chapter"
              onClick={() => setOpenCreateChapter(true)}
            >
              +
            </button>
          )}

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      {/* ✅ Desktop collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-colors z-50"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
      {/* ✅ Desktop header */}
      <div className="hidden md:flex items-center justify-between px-3 pt-4 pb-2">
        {!collapsed && (
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 break-words">
              {storyTitle}
            </h3>
            <p className="text-xs text-gray-500">Chapter List</p>
          </div>
        )}

        {!collapsed && (
          <button
            className="p-2 rounded-md hover:bg-gray-100 transition-colors text-xl font-semibold"
            title="Create chapter"
            onClick={() => setOpenCreateChapter(true)}
          >
            +
          </button>
        )}
      </div>
      {/* ✅ Scrollable list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {loading ? (
          <div className="text-sm text-gray-500 px-3 py-2">Loading...</div>
        ) : chapters.length === 0 ? (
          <div className="text-sm text-gray-500 px-3 py-2">No chapters yet</div>
        ) : (
          <div className="space-y-2 mt-2">
            {normalChapters.map((ch) => {
              const chapterBranches = getBranchesOf(ch._id);
              const isExpanded = expanded[ch._id] ?? false;

              return (
                <div key={ch._id} className="space-y-1">
                  {/* ✅ Chapter item (hover shows + branch) */}
                  {/* ✅ Chapter item (hover shows + branch) */}
                  {/* ✅ Chapter item (ChatGPT-style: icons inside the same item) */}
                  <div key={ch._id} className="space-y-1">
                    <button
                      onClick={!collapsed ? () => {
                        setSelectedChapter(ch);
                        setSidebarOpen(false);
                      } : undefined}
                      className={`
                        group w-full flex items-center justify-between
                        ${collapsed ? "px-2 justify-center cursor-default" : "px-3"}
                        py-2.5 rounded-lg border transition
                        ${
                          selectedChapter?._id === ch._id
                            ? "bg-gray-100 text-gray-900 border-gray-300"
                            : collapsed
                              ? "bg-white text-gray-700 border-gray-200"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                        }
                      `}
                      title={collapsed ? ch.title : undefined}
                    >
                      {/* ✅ LEFT: Chapter title */}
                      {!collapsed ? (
                        <span className="text-sm font-medium truncate">
                          {ch.title}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold">C</span>
                      )}

                      {/* ✅ RIGHT: Actions */}
                      {!collapsed && (
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Expand toggle */}
                          {chapterBranches.length > 0 && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpanded((prev) => ({
                                  ...prev,
                                  [ch._id]: !(prev[ch._id] ?? false),
                                }));
                              }}
                              className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-gray-200 text-gray-700 cursor-pointer select-none"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? "▾" : "▸"}
                            </span>
                          )}

                          {/* Locked by name */}
                          {ch.isLocked && ch.lockedBy?.name && (
                            <span className="text-[11px] text-gray-600 truncate max-w-[80px]">
                              {ch.lockedBy.name}
                            </span>
                          )}

                          {/* ✅ Three dot menu - Only show if not locked OR locked by current user */}
                          {canShowActionMenu(ch) && (
                              <div className="relative">
                                {/* Three-dot trigger */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenActionMenuId((prev) =>
                                      prev === ch._id ? null : ch._id,
                                    );
                                  }}
                                  className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-gray-200 transition"
                                  title="Actions"
                                >
                                  <MoreVertical
                                    size={18}
                                    className="text-gray-700"
                                  />
                                </button>

                                {/* Dropdown */}
                                {openActionMenuId === ch._id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                                  >
                                    {/* Rename */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        setRenameTarget(ch);
                                        setOpenRenameModal(true);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                                    >
                                      <Pencil size={16} />
                                      Rename
                                    </button>

                                    {/* Delete */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionMenuId(null);
                                        setDeleteTarget(ch);
                                        setOpenDeleteModal(true);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm border-t hover:bg-red-50 text-red-600"
                                    >
                                      <Trash2 size={16} />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                          {/* Lock icon */}
                          <span className="w-8 h-8 flex items-center justify-center">
                            {ch.isLocked ? (
                              <Lock size={16} className="text-gray-700" />
                            ) : (
                              <Unlock size={16} className="text-gray-400" />
                            )}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* ✅ Branch list under chapter */}
                  {!collapsed && chapterBranches.length > 0 && isExpanded && (
                    <div className="ml-5 border-l border-gray-200 pl-3 space-y-1">
                      {chapterBranches.map((b) => (
                        <div key={b._id} className="relative">
                          {/* Branch row */}
                          <button
                            onClick={() => {
                              setSelectedChapter(b);
                              setSidebarOpen(false);
                            }}
                            className={`
                              group w-full flex items-center justify-between
                              px-3 py-2 rounded-md border text-sm transition
                              ${
                                selectedChapter?._id === b._id
                                  ? "bg-gray-100 text-gray-900 border-gray-300"
                                  : "bg-white border-gray-200 hover:bg-gray-100"
                              }
                            `}
                          >
                            <span className="truncate">{b.title}</span>

                            <div className="flex items-center gap-2 shrink-0">  
                              {/* Locked by name */}
                              {b.isLocked && b.lockedBy?.name && (
                                <span className="text-[11px] text-gray-600 truncate max-w-[70px]">
                                  {b.lockedBy.name}
                                </span>
                              )}

                              {/* Three-dot menu - Only show if not locked OR locked by current user */}
                              {canShowActionMenu(ch) && (
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenActionMenuId((prev) =>
                                          prev === b._id ? null : b._id,
                                        );
                                      }}
                                      className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-gray-200 transition"
                                      title="Actions"
                                    >
                                      <MoreVertical
                                        size={18}
                                        className="text-gray-700"
                                      />
                                    </button>

                                    {/* Dropdown */}
                                    {openActionMenuId === b._id && (
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute right-2 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                                      >
                                        {/* Rename */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenActionMenuId(null);
                                            setRenameTarget(b);
                                            setOpenRenameModal(true);
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                                        >
                                          <Pencil size={16} />
                                          Rename
                                        </button>

                                        {/* Delete */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenActionMenuId(null);
                                            setDeleteTarget(b);
                                            setOpenDeleteModal(true);
                                          }}
                                          className="w-full flex items-center gap-2 px-3 py-2 text-sm border-t hover:bg-red-50 text-red-600"
                                        >
                                          <Trash2 size={16} />
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}

                              {/* Lock icon */}
                              <span className="w-8 h-8 flex items-center justify-center">
                                {b.isLocked ? (
                                  <Lock size={16} className="text-gray-700" />
                                ) : (
                                  <Unlock size={16} className="text-gray-400" />
                                )}
                              </span>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* ✅ Create Chapter Modal */}
      {openCreateChapter && (
        <CreateChapterModal
          titleText="Create Chapter"
          placeholder="Enter chapter title"
          onClose={() => setOpenCreateChapter(false)}
          onCreate={async (title) => {
            await createChapter(storyId, title, null);
            setOpenCreateChapter(false);
            await loadSidebar();
          }}
        />
      )}
      {/* ✅ Create Branch Modal */}
      {openCreateBranch && (
        <CreateChapterModal
          titleText={`Create Branch`}
          placeholder={`Enter branch title`}
          onClose={() => {
            setOpenCreateBranch(false);
            setBranchParent(null);
          }}
          onCreate={async (title) => {
            await createChapter(storyId, title, branchParent?._id);
            setOpenCreateBranch(false);
            setBranchParent(null);
            await loadSidebar();
          }}
        />
      )}
      {/*rename modal */}
      {openRenameModal && renameTarget && (
        <RenameChapterModal
          chapter={renameTarget}
          onClose={() => {
            setOpenRenameModal(false);
            setRenameTarget(null);
          }}
          onSuccess={async () => {
            await loadSidebar();
            setOpenRenameModal(false);
            setRenameTarget(null);
          }}
        />
      )}
      {/* delete modale render */}
      {openDeleteModal && deleteTarget && (
        <DeleteChapterModal
          chapter={deleteTarget}
          onClose={() => {
            setOpenDeleteModal(false);
            setDeleteTarget(null);
          }}
          onConfirm={async () => {
            await deleteChapter(deleteTarget._id);
            await loadSidebar();
            setOpenDeleteModal(false);
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

export default ChapterSidebar;
