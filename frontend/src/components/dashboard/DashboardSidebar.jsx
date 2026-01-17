import {
  PlusCircle,
  BookOpen,
  CheckCircle,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function DashboardSidebar({
  active,
  setActive,
  sidebarOpen,
  collapsed,
  setCollapsed,
  setSidebarOpen,
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <aside
      className={`
        fixed top-16 left-0 z-50
        h-[calc(100vh-4rem)]
        bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        ${collapsed ? "w-20" : "w-64"}
        flex flex-col shadow-sm
      `}
    >
      {/* ✅ Mobile Header (Dashboard + Close in same line) */}
      <div className="md:hidden flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg shrink-0">
            <LayoutDashboard className="h-6 w-6 text-gray-900" />
          </div>

          <h2 className="text-lg font-bold text-slate-800 whitespace-nowrap">
            Dashboard
          </h2>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <X size={22} />
        </button>
      </div>

      {/* ✅ Desktop Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 hidden md:flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-colors z-50"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* ✅ TOP Section */}
      <div className="px-3 pt-6">
        {/* ✅ Desktop Header / Title (ONLY desktop) */}
        <div className="hidden md:block">
          <div
            className={`flex items-center px-1 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="p-2 bg-gray-100 rounded-lg shrink-0">
              <LayoutDashboard className="h-6 w-6 text-gray-900" />
            </div>

            {!collapsed && (
              <h2 className="text-lg font-bold text-slate-800 whitespace-nowrap">
                Dashboard
              </h2>
            )}
          </div>
        </div>

        {/* ✅ Navigation Items */}
        <nav className="mt-4 space-y-1">
          {/* Create */}
          <button
            onClick={() => {
              setActive("create");
              setSidebarOpen(false);
            }}
            className={`
              w-full flex items-center
              ${collapsed ? "justify-center px-2" : "px-3"}
              py-2.5 rounded-lg transition-all duration-200
              ${
                active === "create"
                  ? "bg-black text-white shadow-md shadow-gray-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }
            `}
          >
            <PlusCircle size={20} />
            {!collapsed && (
              <span className="ml-3 font-medium text-sm tracking-wide">
                Create a Story
              </span>
            )}
          </button>

          {/* Ongoing */}
          <button
            onClick={() => {
              setActive("ongoing");
              setSidebarOpen(false);
            }}
            className={`
              w-full flex items-center
              ${collapsed ? "justify-center px-2" : "px-3"}
              py-2.5 rounded-lg transition-all duration-200
              ${
                active === "ongoing"
                  ? "bg-black text-white shadow-md shadow-gray-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }
            `}
          >
            <BookOpen size={20} />
            {!collapsed && (
              <span className="ml-3 font-medium text-sm tracking-wide">
                My Ongoing Stories
              </span>
            )}
          </button>

          {/* Published */}
          <button
            onClick={() => {
              setActive("published");
              setSidebarOpen(false);
            }}
            className={`
              w-full flex items-center
              ${collapsed ? "justify-center px-2" : "px-3"}
              py-2.5 rounded-lg transition-all duration-200
              ${
                active === "published"
                  ? "bg-black text-white shadow-md shadow-gray-200"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }
            `}
          >
            <CheckCircle size={20} />
            {!collapsed && (
              <span className="ml-3 font-medium text-sm tracking-wide">
                My Published Stories
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* ✅ Bottom Logout */}
      <div className="mt-auto px-3 pb-6">
        <button
          onClick={async () => {
            await logout();
            setSidebarOpen(false);
            navigate("/login");
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-gray-100 transition font-medium text-slate-700"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
