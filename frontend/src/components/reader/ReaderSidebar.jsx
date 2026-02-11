import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

function ReaderSidebar({
  chapters = [],
  selectedChapterId,
  onSelectChapter,
  storyTitle = "Story",
  loading = false,
  isMobile = false,
}) {
  const [expanded, setExpanded] = useState({});

  // Filter normal chapters (no parent) vs branches (has parent)
  const normalChapters = useMemo(
    () => chapters.filter((c) => !c.parentChapter),
    [chapters]
  );

  const branches = useMemo(
    () => chapters.filter((c) => c.parentChapter),
    [chapters]
  );

  // Debug logging
  console.log('🔍 ReaderSidebar Debug:');
  console.log('  Total chapters:', chapters.length);
  console.log('  All chapters:', chapters);
  console.log('  Normal chapters:', normalChapters.length, normalChapters);
  console.log('  Branches:', branches.length, branches);

  // Get branches for a specific parent chapter
  const getBranchesOf = (parentId) => {
    const found = branches.filter((b) => {
      const parent =
        typeof b.parentChapter === "object"
          ? b.parentChapter?._id
          : b.parentChapter;
      const matches = String(parent) === String(parentId);
      console.log(`  Checking branch "${b.title}": parent=${parent}, parentId=${parentId}, matches=${matches}`);
      return matches;
    });
    console.log(`  getBranchesOf(${parentId}): found ${found.length} branches`, found);
    return found;
  };

  return (
    <div className={`h-125 flex flex-col bg-white overflow-hidden ${!isMobile ? 'border-r border-gray-200' : ''}`}>
      {/* Header - Only show on desktop */}
      {!isMobile && (
        <div className="px-4 py-3 border-b border-gray-200 shrink-0">
          <p
            className="text-sm font-semibold text-gray-900 truncate"
            title={storyTitle}
          >
            {storyTitle}
          </p>
          <p className="text-xs text-gray-500">Chapters</p>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 bg-gray-100 rounded-md animate-pulse"
              />
            ))}
          </div>
        ) : chapters.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-500">
            No chapters available.
          </div>
        ) : (
          <div className="space-y-1">
            {normalChapters.map((ch) => {
              const chapterBranches = getBranchesOf(ch._id);
              const isExpanded = expanded[ch._id] ?? false;
              const isActive = ch._id === selectedChapterId;

              return (
                <div key={ch._id} className="space-y-1">
                  {/* Main Chapter */}
                  <button
                    onClick={() => onSelectChapter(ch._id)}
                    className={`
                      w-full flex items-center justify-between
                      px-3 py-2.5 text-sm rounded-lg border transition-all
                      ${
                        isActive
                          ? "bg-blue-50 border-blue-200 text-blue-900 font-medium shadow-sm"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                      }
                    `}
                  >
                    <span className="truncate flex-1 text-left">
                      {ch.title || "Untitled Chapter"}
                    </span>

                    {chapterBranches.length > 0 && (
                      <ChevronDown
                        size={16}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded((prev) => ({
                            ...prev,
                            [ch._id]: !prev[ch._id],
                          }));
                        }}
                        className={`
                          ml-2 shrink-0 text-gray-500 transition-transform duration-200
                          ${isExpanded ? "rotate-180" : ""}
                        `}
                      />
                    )}
                  </button>

                  {/* Branches */}
                  {chapterBranches.length > 0 && isExpanded && (
                    <div className="ml-4 pl-3 border-l-2 border-blue-100 space-y-1 py-1">
                      {chapterBranches.map((b) => {
                        const isBranchActive = b._id === selectedChapterId;

                        return (
                          <button
                            key={b._id}
                            onClick={() => onSelectChapter(b._id)}
                            className={`
                              w-full text-left px-3 py-2 text-sm rounded-md border transition-all
                              ${
                                isBranchActive
                                  ? "bg-blue-50 border-blue-200 text-blue-900 font-medium"
                                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                              }
                            `}
                          >
                            <span className="truncate block">
                              {b.title || "Untitled Branch"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReaderSidebar;
