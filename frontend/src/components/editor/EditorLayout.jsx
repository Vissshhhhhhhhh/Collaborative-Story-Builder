import { useState, useEffect} from "react";
import ChapterSidebar from "./ChapterSidebar";
import EditorHeader from "./EditorHeader";
import MetaPanel from "./MetaPanel";
import TextEditor from "./TextEditor";
import { getStoryById } from "../../api/storyApi";
import Navbar from "../common/Navbar";
function EditorLayout({ storyId }) {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterDetails, setChapterDetails] = useState(null);
  const [storyTitle, setStoryTitle] = useState("Story");
  
  // sidebar control
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [collapsed, setCollapsed] = useState(false); // desktop

  // mobile meta popup
  const [metaOpen, setMetaOpen] = useState(false);

  useEffect(() => {
    async function loadStoryTitle() {
      try {
        const res = await getStoryById(storyId);
        setStoryTitle(res.data.story?.title || "Story");
      } catch (err) {
        console.error(err.response?.data || err.message);
        setStoryTitle("Story");
      }
    }

    loadStoryTitle();
  }, [storyId]);


  return (
    <div className="h-full w-full flex overflow-hidden">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      {/* ✅ Mobile overlay when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ✅ LEFT Sidebar (collapsible desktop + slide-in mobile) */}
      <aside
        className={`
          fixed md:static top-0 md:top-auto left-0 z-50
          h-full md:h-full
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${collapsed ? "w-20" : "w-72"}
          overflow-visible
        `}
      >
        <div className="h-full flex flex-col">
          <ChapterSidebar
            storyId={storyId}
            storyTitle={storyTitle}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onChaptersLoaded={(chapters) => {
              if (!selectedChapter && chapters.length > 0) {
                setSelectedChapter(chapters[0]);
              }
            }}
          />
        </div>
      </aside>

      {/* ✅ MAIN */}
      <section className="flex-1 h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-gray-200 bg-white">
          
          {/* mobile dropdown   */}
          
          <EditorHeader
            storyTitle={storyTitle}
            selectedChapter={selectedChapter}
            onOpenSidebar={() => setSidebarOpen(true)}
            metaContent={<MetaPanel chapterDetails={chapterDetails} />}
          />
        </div>

        {/* Editor scrollable area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            <TextEditor
              selectedChapter={selectedChapter}
              setChapterDetails={setChapterDetails}
            />

          </div>
        </div>
      </section>

      {/* ✅ RIGHT Meta Panel (Desktop only fixed) */}
      <aside className="hidden lg:block w-72 bg-white border-l border-gray-200 h-full overflow-hidden">
        <div className="p-4">
          <MetaPanel chapterDetails={chapterDetails}/>
        </div>
      </aside>

      
    </div>
  );
}

export default EditorLayout;
