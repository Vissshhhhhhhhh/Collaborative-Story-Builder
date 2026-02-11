import { useEffect, useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import OngoingStories from "../components/dashboard/OngoingStories";
import PublishedStories from "../components/dashboard/PublishedStories";
import CreateStoryModal from "../components/story/CreateStoryModal";
import Navbar from "../components/common/Navbar";
import { ChevronRight } from "lucide-react";

function Dashboard() {
  const [active, setActive] = useState("ongoing");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [navbarMenuOpen, setNavbarMenuOpen] = useState(false);

  // Close sidebar on ESC (mobile)
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") setSidebarOpen(false);
    }

    if (sidebarOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      {/* NAVBAR */}
      <Navbar page="Dashboard" onMobileMenuChange={setNavbarMenuOpen} />

      <div className="h-[calc(100vh-4rem)] flex overflow-hidden relative">
        {/* ✅ MOBILE: Floating "Open Sidebar" button (NOT hamburger) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="
              md:hidden
              fixed left-1 top-[70px]
              z-50
              h-6 w-6
              rounded-full
              border border-gray-200
              bg-white
              shadow-md
              flex items-center justify-center
              text-gray-700
              hover:bg-gray-50
              transition
            "
            title="Open dashboard sidebar"
          >
             <ChevronRight size={14} />
          </button>
        )}


        {/* Mobile Overlay (ONLY when sidebar open) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <DashboardSidebar
          active={active}
          setActive={setActive}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 md:p-8 bg-gray-100 min-h-[calc(100vh-4rem)] overflow-y-auto">
          {successMessage && (
            <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-green-800">
              {successMessage}
            </div>
          )}

          {active === "ongoing" && <OngoingStories sidebarOpen={sidebarOpen} navbarMenuOpen={navbarMenuOpen} />}
          {active === "published" && <PublishedStories sidebarOpen={sidebarOpen} navbarMenuOpen={navbarMenuOpen} />}

          {active === "create" && (
            <div className="pt-4">
              <CreateStoryModal
                onCreated={(storyTitle) => {
                  setActive("ongoing");
                  const trimmed =
                    storyTitle.length > 40
                      ? storyTitle.slice(0, 40) + "…"
                      : storyTitle;
                  setSuccessMessage(`Story "${trimmed}" created successfully.`);
                  setTimeout(() => setSuccessMessage(""), 3000);
                }}
                onClose={() => setActive("ongoing")}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
