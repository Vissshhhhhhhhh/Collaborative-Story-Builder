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

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";

  const first = parts[0][0]?.toUpperCase() || "";
  const last = parts[parts.length - 1][0]?.toUpperCase() || "";
  return (first + last) || "U";
}

function getAvatarColor(name) {
  const str = name || "user";
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);

  const palette = [
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-800",
    "bg-rose-100 text-rose-700",
    "bg-slate-100 text-slate-700",
  ];

  return palette[Math.abs(hash) % palette.length];
}

function InitialsAvatar({ name }) {
  const initials = getInitials(name);
  const color = getAvatarColor(name);

  return (
    <div
      className={`w-10 h-10 ${color} rounded-full flex items-center justify-center font-semibold border border-gray-200 select-none`}
    >
      {initials}
    </div>
  );
}

function DashboardSidebar({
  active,
  setActive,
  sidebarOpen,
  collapsed,
  setCollapsed,
  setSidebarOpen,
}) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  return (
    <aside
      className={`
        fixed md:static
        top-16 left-0 z-50
        h-[calc(100vh-4rem)]
        bg-white border-r border-gray-200
        flex flex-col shadow-sm

        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0

          transition-[width] duration-300 ease-in-out
          ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* ✅ Mobile Header (Dashboard + Close in same line) */}
      <div className="md:hidden flex items-start justify-between px-4 py-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <InitialsAvatar name={user?.name || "User"} />

          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap leading-none">
              Dashboard
            </h2>

            <div className="mt-1.5">
              <p className="text-xs text-gray-500">
                Signed in as{" "}
                <span className="font-semibold text-gray-700">
                  {user?.name || "User"}
                </span>
              </p>

              {user?.email && (
                <p className="text-xs text-gray-400 truncate max-w-[210px]">
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-xl hover:bg-gray-100 transition"
          title="Close"
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
        {/* ✅ Desktop Header / Title */}
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
                  ? "border border-gray-300 bg-gray-50 text-gray-900"
                  : "border border-transparent text-slate-600 hover:bg-gray-50 hover:text-gray-900"
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
                  ? "border border-gray-300 bg-gray-50 text-gray-900"
                  : "border border-transparent text-slate-600 hover:bg-gray-50 hover:text-gray-900"
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
                  ? "border border-gray-300 bg-gray-50 text-gray-900"
                  : "border border-transparent text-slate-600 hover:bg-gray-50 hover:text-gray-900"
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
            navigate("/main", { replace: true });
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
