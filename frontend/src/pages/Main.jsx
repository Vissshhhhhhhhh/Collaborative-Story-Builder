import { useEffect, useMemo, useState } from "react";
import { getPublicPublishedStories, getExternalStories } from "../api/storyApi";
import StoryCard from "../components/story/StoryCard";
import Navbar from "../components/common/Navbar";
import Loader from "../components/common/Loader"

function Main() {
  const [internalStories, setInternalStories] = useState([]);
  const [externalStories, setExternalStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Filter: all | internal | external
  const [filter, setFilter] = useState("all");

  // ✅ info popup
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    const fetchAllStories = async () => { 
      try {
        setLoading(true);

        const [internalRes, externalRes] = await Promise.all([
          getPublicPublishedStories(),
          getExternalStories(),
        ]);

        setInternalStories(internalRes.data?.stories || []);
        setExternalStories(externalRes.data?.results?.slice(0, 50) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStories();
  }, []);

  const showInternal = filter === "all" || filter === "internal";
  const showExternal = filter === "all" || filter === "external";

  const activeBtnClass = "bg-gray-100 text-gray-900 border-gray-300";
  const normalBtnClass = "bg-white text-gray-700 border-transparent hover:bg-gray-50 hover:text-gray-900";


  if (loading) {
    return (
      <div className="p-6">
        <Loader />
      </div>
    );
  }

  return (
     <div className="min-h-screen bg-gray-100 pt-16">
          <Navbar page="Main" />
          <div className="p-4 md:p-8 space-y-8">
            {/* ✅ Header + Filter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Explore Stories
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Read community stories and discover classic books.
                </p>
              </div>

              {/* ✅ Filter bar */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1.5 gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 text-sm rounded-lg border transition ${
                      filter === "all" ? activeBtnClass : normalBtnClass
                    }`}
                  >
                    All
                  </button>

                  <button
                    onClick={() => setFilter("internal")}
                    className={`px-4 py-2 text-sm rounded-lg border transition ${
                      filter === "internal" ? activeBtnClass : normalBtnClass
                    }`}
                  >
                    Community
                  </button>

                  <button
                    onClick={() => setFilter("external")}
                    className={`px-4 py-2 text-sm rounded-lg border transition ${
                      filter === "external" ? activeBtnClass : normalBtnClass
                    }`}
                  >
                    Classic
                  </button>
                </div>

                {/* ✅ Info button (both mobile + desktop) */}
               <button
                onClick={() => setInfoOpen(true)}
                className="h-9 w-9 md:h-12 md:w-12 shrink-0 rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 transition flex items-center justify-center text-gray-700 text-sm md:text-base"
                title="Info"
              >
                i
              </button>

              </div>
            </div>

            {/* ✅ Internal Stories Section */}
            {showInternal && (
              <section className="space-y-4">
                <div className="flex items-end justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Community Stories
                  </h2>
                  <p className="text-sm text-gray-500">
                    {internalStories.length} stories
                  </p>
                </div>

                {internalStories.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 text-gray-600">
                    No community stories available right now.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {internalStories.map((story) => (
                      <StoryCard key={story._id} story={story} source="internal" />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ✅ External Stories Section */}
            {showExternal && (
              <section className="space-y-4">
                <div className="flex items-end justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Classic Stories
                  </h2>
                  <p className="text-sm text-gray-500">
                    {externalStories.length} books
                  </p>
                </div>

                {externalStories.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 text-gray-600">
                    No classic stories available right now.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {externalStories.map((book) => (
                      <StoryCard key={book.id} story={book} source="external" />
                    ))}
                  </div>

                )}
              </section>
            )}

            {/* ✅ Info Popup */}
            {infoOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/40 z-[90]"
                  onClick={() => setInfoOpen(false)}
                />

                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[92%] max-w-md">
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                      <p className="font-semibold text-gray-900">Explore Info</p>
                      <button
                        onClick={() => setInfoOpen(false)}
                        className="px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-5 space-y-3 text-sm text-gray-700">
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <p className="font-semibold text-gray-900">Community</p>
                        <p className="mt-1 text-gray-600">
                          Stories published by users from StoryBuilder.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <p className="font-semibold text-gray-900">Classic</p>
                        <p className="mt-1 text-gray-600">
                          Public domain stories fetched from an external source.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <p className="font-semibold text-gray-900">
                          Click any story card
                        </p>
                        <p className="mt-1 text-gray-600">
                          It will open in the Reader page.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
        </div>
       </div> 
  );
}
export default Main;
