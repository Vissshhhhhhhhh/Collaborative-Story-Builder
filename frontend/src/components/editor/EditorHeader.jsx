import { useEffect, useRef, useState } from "react";

function EditorHeader({ selectedChapter, onOpenSidebar, metaContent, storyTitle}) {
  const [metaOpen, setMetaOpen] = useState(false);
  const metaBtnRef = useRef(null);
  const metaBoxRef = useRef(null);
  
  useEffect(() => {
    function handleOutside(e) {
      if (!metaOpen) return;
  
      const insideBox = metaBoxRef.current?.contains(e.target);
      const insideBtn = metaBtnRef.current?.contains(e.target);
  
      if (!insideBox && !insideBtn) setMetaOpen(false);
    }
  
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [metaOpen]);

  return (
    <div className="px-4 py-3 flex items-center justify-between">
      {/* Left: Sidebar button + Title */}
      <div className="flex items-center gap-3">
        {/* ✅ Mobile sidebar open button */}
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          title="Open Chapter List"
        >
          ☰
        </button>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {storyTitle || "Story"}
          </h2>
        </div>
      </div>

      {/* Right: Meta menu + Save */}
      <div className="flex items-center gap-3">
        {/* ✅ Mobile meta button */}
       <div className="relative lg:hidden">
          <button
            ref={metaBtnRef}
            onClick={() => setMetaOpen((p) => !p)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Chapter info"
          >
            ⋮
          </button>

          {metaOpen && (
            <div
              ref={metaBoxRef}
              className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
            >
              {/* MetaPanel injected here */}
              <div className="p-3">{metaContent}</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default EditorHeader;
