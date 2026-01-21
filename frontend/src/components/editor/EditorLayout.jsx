import { useState, useEffect } from "react";
import ChapterSidebar from "./ChapterSidebar";
import EditorHeader from "./EditorHeader";
import MetaPanel from "./MetaPanel";
import TextEditor from "./TextEditor";
import { getStoryById } from "../../api/storyApi";
import Navbar from "../common/Navbar";
import { getChapterContent } from "../../api/chapterApi";

function EditorLayout({ storyId }) {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterDetails, setChapterDetails] = useState(null);
  const [storyTitle, setStoryTitle] = useState("Story");

  // sidebar control
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [collapsed, setCollapsed] = useState(false); // desktop
  const [sidebarLoaded, setSidebarLoaded] = useState(false);

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

  const refreshChapterDetails = async () => {
      if (!selectedChapter?._id) return;

      try {
        const res = await getChapterContent(selectedChapter._id);
        setChapterDetails(res.data.chapter || null);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
  };

  return (
    <div className="h-full w-full overflow-hidden">
      {/* ✅ Navbar fixed top */}
      <Navbar page="Editor" />

      {/* ✅ whole editor area below navbar */}
      <div className=" fixed w-full h-full">
        <div className="h-[calc(100vh-4rem)] w-full flex overflow-hidden">
          {/* ✅ Mobile overlay when sidebar open */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ✅ LEFT Sidebar */}
          <aside
            className={`
              fixed md:static top-16 md:top-auto left-0 z-50
              h-[calc(100vh-4rem)]
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
                  setSidebarLoaded(true);

                  if (!selectedChapter && chapters.length > 0) {
                    setSelectedChapter(chapters[0]);
                  }
                }}

              />
            </div>
          </aside>

          {/* ✅ MAIN */}
          <section className="flex-1 h-full overflow-hidden flex flex-col bg-gray-50">
            {/* Header */}
            <div className="shrink-0 border-b border-gray-200 bg-white">
              <EditorHeader
                storyTitle={storyTitle}
                selectedChapter={selectedChapter}
                onOpenSidebar={() => setSidebarOpen(true)}
                metaContent={<MetaPanel chapterDetails={chapterDetails} onRefresh={refreshChapterDetails} />}
                chapterDetails={chapterDetails}
              />
            </div>

            {/* ✅ only editor content scrolls */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto p-4">
                <TextEditor
                sidebarLoaded={sidebarLoaded}
                  selectedChapter={selectedChapter}
                  setChapterDetails={setChapterDetails}
                  chapterDetails={chapterDetails}
                />
              </div>
            </div>
          </section>

          {/* ✅ RIGHT Meta Panel (Desktop only fixed) */}
          <aside className="hidden lg:block w-72 bg-white border-l border-gray-200 h-full overflow-hidden">
            <div className="p-4">
              <MetaPanel chapterDetails={chapterDetails} onRefresh={refreshChapterDetails}/>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default EditorLayout;
