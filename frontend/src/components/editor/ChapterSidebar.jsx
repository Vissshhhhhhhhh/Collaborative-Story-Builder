import { useEffect, useState } from "react";
import { getChapterSidebar, createChapter } from "../../api/chapterApi";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import CreateChapterModal from "./CreateChapterModal";

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
}) {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  // ✅ Modals
  const [openCreateChapter, setOpenCreateChapter] = useState(false);
  const [openCreateBranch, setOpenCreateBranch] = useState(false);
  const [branchParent, setBranchParent] = useState(null);

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

  // ✅ For indentation: group branches under parent
  const normalChapters = chapters.filter((c) => !c.isBranch);
  const branches = chapters.filter((c) => c.isBranch);

  const getBranchesOf = (parentId) =>
    branches.filter((b) => b.parentChapter?.toString() === parentId.toString());


  return (
    <div className="h-full flex flex-col relative">
      {/* ✅ Mobile header */}
      <div className="md:hidden flex items-center justify-between px-3 py-3">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 break-words">
            {storyTitle}
          </h3>
          <p className="text-xs text-gray-500">Chapter List</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-md hover:bg-gray-100 transition-colors text-2xl font-semibold"
            title="Create chapter"
            onClick={() => setOpenCreateChapter(true)}
          >
            +
          </button>

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
          <div className="text-sm text-gray-500 px-3 py-2">
            No chapters yet
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {normalChapters.map((ch) => {
              const chapterBranches = getBranchesOf(ch._id);
              const isExpanded = expanded[ch._id] ?? true;
              
              return (
                <div key={ch._id} className="space-y-1">
                  {/* ✅ Chapter item (hover shows + branch) */}
                 <div className="group flex items-center gap-1">
                  {/* ✅ VS Code style dropdown toggle */}
                  {!collapsed && chapterBranches.length > 0 && (
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [ch._id]: !(prev[ch._id] ?? true),
                        }))
                      }
                      className="w-7 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? "▾" : "▸"}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedChapter(ch);
                      setSidebarOpen(false); // ✅ mobile auto close
                    }}
                    className={`
                      flex-1 flex items-center
                      ${collapsed ? "justify-center px-2" : "px-3"}
                      py-2.5 rounded-lg border transition
                      ${
                        selectedChapter?._id === ch._id
                          ? "bg-black text-white border-black"
                          : "bg-white border-gray-200 hover:bg-gray-100"
                      }
                    `}
                    title={collapsed ? ch.title : undefined}
                  >
                    {!collapsed && (
                      <span className="text-sm font-medium truncate">{ch.title}</span>
                    )}
                    {collapsed && <span className="text-sm font-semibold">C</span>}
                  </button>

                  {/* ✅ Add Branch button on hover (like ChatGPT sidebar) */}
                  {!collapsed && (
                    <button
                      onClick={() => {
                        setBranchParent(ch);
                        setOpenCreateBranch(true);
                      }}
                      className="ml-2 hidden group-hover:flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 transition-colors text-xl font-semibold"
                      title="Add Branch"
                    >
                      +
                    </button>
                  )}
                </div>


                  {/* ✅ Branch list under chapter */}
                 {!collapsed && chapterBranches.length > 0 && isExpanded && (
                    <div className="ml-5 border-l border-gray-200 pl-3 space-y-1">
                      {chapterBranches.map((b) => (
                        <button
                          key={b._id}
                          onClick={() => {
                            setSelectedChapter(b);
                            setSidebarOpen(false);
                          }}
                          className={`
                            w-full text-left px-3 py-2 rounded-md border text-sm transition
                            ${
                              selectedChapter?._id === b._id
                                ? "bg-black text-white border-black"
                                : "bg-white border-gray-200 hover:bg-gray-100"
                            }
                          `}
                        >
                          {b.title}
                        </button>
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
    </div>
  );
}

export default ChapterSidebar;
