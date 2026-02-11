import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { ChevronDown } from "lucide-react";
import {
  getExternalStoryById,
  fetchExternalTextByUrl,
  getPublicStoryById,
} from "../api/storyApi";
import {
  getPublicChapterSidebar,
  getPublicChapterContent,
} from "../api/chapterApi";
import ReaderSidebar from "../components/reader/ReaderSidebar";

function Reader() {
  const { source, id } = useParams();
  const navigate = useNavigate();

  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Internal story state
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [chapterContent, setChapterContent] = useState("");

  // External book state
  const [externalBook, setExternalBook] = useState(null);
  const [externalText, setExternalText] = useState("");

  const isInternal = source === "internal";
  const isExternal = source === "external";

  const selectedChapterTitle = useMemo(() => {
    if (!isInternal) return "";
    const ch = chapters.find((c) => c._id === selectedChapterId);
    return ch?.title || "Untitled Chapter";
  }, [chapters, selectedChapterId, isInternal]);

  const readerTitle = useMemo(() => {
    if (isInternal) return story?.title || "Story";
    return externalBook?.title || "Book";
  }, [isInternal, story?.title, externalBook?.title]);

  // Load initial data
  useEffect(() => {
    const loadReader = async () => {
      setSidebarLoading(true);
      setError("");

      try {
        if (isInternal) {
          const storyRes = await getPublicStoryById(id);
          setStory(storyRes.data.story);

          const sidebarRes = await getPublicChapterSidebar(id);
          console.log(sidebarRes.data);
          const list = sidebarRes.data?.chapters || [];
          
          setChapters(list);

          if (list.length > 0) {
            const firstChapter = list[0];
            setSelectedChapterId(firstChapter._id);

            setContentLoading(true);
            const chapterRes = await getPublicChapterContent(firstChapter._id);
            setChapterContent(chapterRes.data?.chapter?.content || "");
            setContentLoading(false);
          } else {
            setSelectedChapterId(null);
            setChapterContent("");
          }
        }

        if (isExternal) {
          const bookRes = await getExternalStoryById(id);
          const book = bookRes.data;
          setExternalBook(book);

          const plain =
            book?.formats?.["text/plain; charset=utf-8"] ||
            book?.formats?.["text/plain"];
          const readableUrl = plain || null;

          if (!readableUrl) {
            setExternalText("");
            return;
          }

          setContentLoading(true);
          const textRes = await fetchExternalTextByUrl(readableUrl);
          setExternalText(textRes.data || "");
          setContentLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load reader");
      } finally {
        setSidebarLoading(false);
      }
    };

    loadReader();
  }, [source, id, isInternal, isExternal]);

  // Handle chapter selection
  const handleSelectChapter = async (chapterId) => {
    setSelectedChapterId(chapterId);
    setContentLoading(true);
    setError("");

    try {
      const chapterRes = await getPublicChapterContent(chapterId);
      setChapterContent(chapterRes.data?.chapter?.content || "");
    } catch (err) {
      setError("Failed to load chapter");
    } finally {
      setContentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar page="Reader" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {readerTitle}
              </h1>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition text-gray-700 font-medium text-sm">
              Back
            </button>
          </div>

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Mobile Chapter Dropdown */}
        {isInternal && (
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-900">
              <span>{selectedChapterTitle || "Select Chapter"}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  mobileSidebarOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Panel */}
            {mobileSidebarOpen && (
              <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[60vh] overflow-y-auto">
                <ReaderSidebar
                  chapters={chapters}
                  selectedChapterId={selectedChapterId}
                  onSelectChapter={(id) => {
                    handleSelectChapter(id);
                    setMobileSidebarOpen(false);
                  }}
                  storyTitle={story?.title || "Story"}
                  loading={sidebarLoading}
                  isMobile={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Desktop Layout: Sidebar + Content */}
        <div className="flex gap-4">
          {/* Desktop Sidebar */}
          {isInternal && (
            <div className="hidden lg:block w-[280px] shrink-0">
              <div className="sticky top-20 h-[calc(70vh-6rem)]">
                <ReaderSidebar
                  chapters={chapters}
                  selectedChapterId={selectedChapterId}
                  onSelectChapter={handleSelectChapter}
                  storyTitle={story?.title || "Story"}
                  loading={sidebarLoading}
                  isMobile={false}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Content Loading State */}
            {contentLoading ? (
              <div className="bg-white  border border-gray-200 p-8 min-h-[600px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  {/* Simple Spinner */}
                  <div className="flex justify-center">
                    <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                  
                  {/* Loading Text */}
                  <p className="text-sm text-gray-500">Loading chapter...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white  border border-gray-200 h-[calc(100vh-12rem)] max-h-[calc(100vh-12rem)] overflow-hidden flex flex-col">
                {/* Chapter Title Header */}
                {isInternal && (
                  <div className="px-6 md:px-8 py-4 border-b border-gray-200 shrink-0">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      {selectedChapterTitle}
                    </h2>
                    <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full mt-2" />
                  </div>
                )}

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                  <div
                    className="prose prose-gray max-w-none
                      prose-headings:text-gray-900
                      prose-p:text-gray-700 prose-p:leading-relaxed
                      prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-gray-900
                      prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded
                    "
                  >
                    {isInternal && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: chapterContent || "<p class='text-gray-500 italic'>No content available for this chapter.</p>",
                        }}
                      />
                    )}
                    {isExternal && (
                      <pre className="whitespace-pre-wrap font-serif text-gray-700 leading-relaxed">
                        {externalText || "No content available."}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reader;
