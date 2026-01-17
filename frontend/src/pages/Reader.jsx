import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getChapterSidebar, getChapterContent } from "../api/chapterApi";

function Reader() {
  const { source, id } = useParams(); // internal | external
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // internal story
  const [chapters, setChapters] = useState([]);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [content, setContent] = useState("");

  // external story
  const [bookMeta, setBookMeta] = useState(null);
  const [bookHtml, setBookHtml] = useState("");

  /* ---------------- INTERNAL STORY ---------------- */

  useEffect(() => {
    if (source !== "internal") return;

    const loadSidebar = async () => {
        try {
          const res = await getSidebar(id);
          const list = res.data.chapters || [];
          setChapters(list);

          if (list.length > 0) {
            setActiveChapterId(list[0]._id);
          } else {
            // 🔑 no chapters → stop loading
            setLoading(false);
          }
        } catch {
          setError("Failed to load chapters");
          setLoading(false);
        }
      };


    loadSidebar();
  }, [source, id]);

  useEffect(() => {
    if (source !== "internal" || !activeChapterId) return;

    const loadContent = async () => {
      try {
        const res = await getChapterContent(activeChapterId);
        setContent(res.data.chapter?.content || "");
      } catch {
        setError("Failed to load chapter content");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [source, activeChapterId]);

  /* ---------------- EXTERNAL STORY ---------------- */

  useEffect(() => {
    if (source !== "external") return;

    const loadExternal = async () => {
      try {
        const metaRes = await axios.get(`https://gutendex.com/books/${id}`);
        setBookMeta(metaRes.data);

        const htmlUrl =
          metaRes.data.formats?.["text/html"] ||
          metaRes.data.formats?.["text/plain"];

        if (!htmlUrl) throw new Error();

        const htmlRes = await axios.get(htmlUrl);
        setBookHtml(htmlRes.data);
      } catch {
        setError("Failed to load external story");
      } finally {
        setLoading(false);
      }
    };

    loadExternal();
  }, [source, id]);

  /* ---------------- STATES ---------------- */

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading…</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  // chapter tree
  const chapterTree = chapters.reduce((acc, ch) => {
    if (!ch.isBranch) {
        acc[ch._id] = { ...ch, branches: [] };
    }
    return acc;
  },{});

  chapters.forEach((ch) => {
    if (ch.isBranch && ch.parentChapter && chapterTree[ch.parentChapter]) {
        chapterTree[ch.parentChapter].branches.push(ch);
    }
   });


  /* ---------------- INTERNAL READER ---------------- */

  if (source === "internal") {
    return (
      <div className="h-screen flex bg-muted/40">

        {/* SHADCN SIDEBAR */}
        <Sidebar className="border-r">
          <SidebarHeader className="border-b px-4 py-3">
            <h2 className="font-semibold text-lg">Chapters</h2>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Story Structure</SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                    {Object.values(chapterTree).map((chapter) => (
                        <SidebarMenuItem key={chapter._id}>
                        
                        {/* Main Chapter */}
                        <SidebarMenuButton
                            onClick={() => setActiveChapterId(chapter._id)}
                            isActive={chapter._id === activeChapterId}
                        >
                            {chapter.title}
                        </SidebarMenuButton>

                        {/* Branches */}
                        {chapter.branches.length > 0 && (
                            <div className="ml-4 mt-1 space-y-1">
                            {chapter.branches.map((branch) => (
                                <SidebarMenuButton
                                key={branch._id}
                                onClick={() => setActiveChapterId(branch._id)}
                                isActive={branch._id === activeChapterId}
                                className="text-sm text-muted-foreground"
                                >
                                ↳ {branch.title}
                                </SidebarMenuButton>
                            ))}
                            </div>
                        )}

                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>

              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* READER CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <article className="max-w-3xl mx-auto px-6 py-10">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: content || "<p>No content</p>"
              }}
            />
          </article>
        </main>
      </div>
    );
  }

  /* ---------------- EXTERNAL READER ---------------- */

  return (
    <div className="min-h-screen bg-muted/40">
      <article className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">{bookMeta?.title}</h1>
          <p className="text-muted-foreground mt-1">
            {bookMeta?.authors?.[0]?.name || "Unknown author"}
          </p>
          <span className="inline-block mt-3 text-xs bg-secondary px-2 py-1 rounded">
            Public Domain
          </span>
        </header>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: bookHtml }}
        />
      </article>
    </div>
  );
}

export default Reader;
