import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { ChevronDown } from "lucide-react";
import {
  getExternalStoryById,
  fetchExternalTextByUrl,
  getPublicStoryById 
} from "../api/storyApi";
import { getPublicChapterSidebar, getPublicChapterContent} from "../api/chapterApi";

function Reader() {
  const { source, id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Internal
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [chapterContent, setChapterContent] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // External
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

  useEffect(() => {
    const loadReader = async () => {
      setLoading(true);
      setError("");

      try {
        // ✅ INTERNAL STORY FLOW
        if (isInternal) {
          const storyRes = await getPublicStoryById(id);
          setStory(storyRes.data.story);

          const sidebarRes = await getPublicChapterSidebar(id);
          const list = sidebarRes.data?.chapters || [];
          setChapters(list);

          if (list.length > 0) {
            const firstChapter = list[0];
            setSelectedChapterId(firstChapter._id);

            const chapterRes = await getPublicChapterContent(firstChapter._id);
            setChapterContent(chapterRes.data?.chapter?.content || "");
          } else {
            setSelectedChapterId(null);
            setChapterContent("");
          }
        }


        // ✅ EXTERNAL STORY FLOW
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

          const textRes = await fetchExternalTextByUrl(readableUrl);
          setExternalText(textRes.data || "");
        }
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load reader");
      } finally {
        setLoading(false);
      }
    };

    loadReader();
  }, [source, id]);

  // ✅ Chapter change (internal)
  const handleSelectChapter = async (chapterId) => {
    setSelectedChapterId(chapterId);
    setLoading(true);
    setError("");

    try {
      const chapterRes = await getPublicChapterContent(chapterId);
      setChapterContent(chapterRes.data?.chapter?.content || "");
    } catch (err) {
      setError("Failed to load chapter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Navbar page="Reader" />

      {/* ✅ Header (not scrollable) */}
      <div className="w-full px-4 md:px-8 py-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {readerTitle}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isInternal ? `Read chapters from StoryBuilder` : `Public domain book`}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition text-gray-700 font-medium"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* ✅ MAIN READER LAYOUT (ONLY RIGHT CONTENT SCROLLS) */}
        {/* ✅ MOBILE CHAPTER DROPDOWN TOGGLE */}
        {isInternal && (
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileSidebarOpen((p) => !p)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-900 transition"
            >
              <span>
                {selectedChapterTitle}
              </span>

              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${
                  mobileSidebarOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* ✅ DROPDOWN PANEL */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                mobileSidebarOpen ? "max-h-[400px] mt-2" : "max-h-0"
              }`}
            >
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-2 space-y-1">
                {chapters.map((ch) => {
                  const active = ch._id === selectedChapterId;

                  return (
                    <button
                      key={ch._id}
                      onClick={() => {
                        handleSelectChapter(ch._id);
                        setMobileSidebarOpen(false); // ✅ close after select
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                        active
                          ? "bg-gray-100 text-gray-900 border border-gray-200"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {ch.title || "Untitled Chapter"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}


        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-gray-600">
            Loading reader...
          </div>
        ) : (
          <div className="flex gap-6">
            {/* ✅ LEFT SIDEBAR (FIXED, NOT SCROLLABLE, NOT GROWING) */}
            {isInternal && (
              <aside
                className="
                  hidden lg:block
                  w-[280px]
                  shrink-0
                  sticky top-16
                  h-[calc(100vh-4rem-8.5rem)]
                "
              >
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">Chapters</p>
                  </div>

                  {/* ✅ NO SCROLL HERE */}
                  <div className="p-2 overflow-hidden">
                    {chapters.length === 0 ? (
                      <div className="p-3 text-sm text-gray-600">
                        No chapters available.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {chapters.slice(0, 12).map((ch) => {
                          const active = ch._id === selectedChapterId;

                          return (
                            <button
                              key={ch._id}
                              onClick={() => handleSelectChapter(ch._id)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                                active
                                  ? "bg-gray-100 text-gray-900 border border-gray-200"
                                  : "hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              {ch.title || "Untitled Chapter"}
                            </button>
                          );
                        })}

                        {chapters.length > 12 && (
                          <p className="px-3 pt-2 text-xs text-gray-400">
                            +{chapters.length - 12} more chapters (not shown)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            )}

            {/* ✅ RIGHT CONTENT (ONLY THIS SCROLLS) */}
            <section
              className={`
                flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden
                h-[calc(100vh-4rem-8.5rem)]
              `}
            >
              <div className="px-5 py-4 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">
                  {isInternal ? selectedChapterTitle : "Book Content"}
                </p>
              </div>

              {/* ✅ SCROLL ONLY HERE */}
              <div className="p-5 overflow-y-auto h-[calc(100%-57px)]">
                {isInternal && (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: chapterContent || "<p>No content.</p>",
                    }}
                  />
                )}

                {isExternal && (
                  <>
                    {externalText ? (
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                        {externalText}
                      </pre>
                    ) : (
                      <div className="text-gray-600 text-sm">
                        This book format is not directly readable here.
                        <div className="mt-3">
                          <a
                            href={externalBook?.formats?.["text/html"] || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition font-medium text-gray-700"
                          >
                            Read on Gutenberg
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reader;
