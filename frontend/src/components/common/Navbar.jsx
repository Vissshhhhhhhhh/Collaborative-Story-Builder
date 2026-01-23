import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "../BrandLogo";

/* ✅ Build initials: "Viswanath" -> V, "Viswanath Paarthiban" -> VP */
function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";

  const first = parts[0][0]?.toUpperCase() || "";
  const last = parts[parts.length - 1][0]?.toUpperCase() || "";
  return (first + last) || "U";
}

/* ✅ Soft background color based on name (stable, no libs) */
function getAvatarColor(name) {
  const str = name || "user";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);

  // Tailwind-friendly fixed palette (professional)
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

/* ✅ Initials Avatar Component */
function InitialsAvatar({ name, size = "md", className = "" }) {
  const initials = getInitials(name);
  const color = getAvatarColor(name);

  const sizeClass =
    size === "sm"
      ? "w-9 h-9 text-sm"
      : size === "lg"
      ? "w-11 h-11 text-base"
      : "w-10 h-10 text-sm";

  return (
    <div
      className={`${sizeClass} ${color} rounded-full flex items-center justify-center font-semibold border border-gray-200 select-none ${className}`}
    >
      {initials}
    </div>
  );
}

function Navbar({ onMenuClick = () => {}, page }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

  
  /* Close profile dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const displayName = useMemo(() => user?.name || "User", [user?.name]);
  const displayEmail = useMemo(() => user?.email || "", [user?.email]);

  /* Common nav links */
  const NavLinks = ({ onClick }) => (
    <>
      <NavLink
        to="/"
        onClick={onClick}
        className={({ isActive }) =>
          isActive
            ? "text-black font-medium"
            : "text-gray-600 hover:text-black"
        }
      >
        Discover
      </NavLink>

      <NavLink
        to="/main"
        onClick={onClick}
        className={({ isActive }) =>
          isActive
            ? "text-black font-medium"
            : "text-gray-600 hover:text-black"
        }
      >
        Explore
      </NavLink>


      {isAuthenticated && (
        <NavLink
          to="/dashboard"
          onClick={onClick}
          className={({ isActive }) =>
            isActive
              ? "text-black font-medium"
              : "text-gray-600 hover:text-black"
          }
        >
          Dashboard
        </NavLink>
      )}
    </>
  );

  return (
    <>
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 h-16 w-full bg-white flex items-center px-6 z-50 border-b border-gray-100">
        {/* ✅ Left: Logo */}
        <div className="flex items-center">
          <BrandLogo />
        </div>

        {/* ✅ Right: Desktop nav + Mobile menu button */}
        <div className="ml-auto flex items-center gap-6">
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <NavLinks />

            {!isAuthenticated ? (
              <button
                onClick={() =>navigate("/login", { state: { from: window.location.pathname } })}
                className="ml-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
              >
                Get Started
              </button>
            ) : (
              <div className="relative ml-4" ref={dropdownRef}>
                {/* ✅ Initials Profile Button */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full hover:bg-gray-50 px-2 py-1 transition"
                  title="Profile menu"
                >
                  <InitialsAvatar name={displayName} size="sm" />
                </button>

                {/* ✅ Professional dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-4 border-b bg-gray-50">
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={displayName} size="lg" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="font-semibold text-gray-900 truncate">
                            {displayName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {displayEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                   <div className="p-3">
                    <button
                      onClick={async () => {
                        setDropdownOpen(false);
                        await logout();
                        navigate("/main", { replace: true });
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition"
                    >
                      Logout
                    </button>
                  </div>

                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className="md:hidden text-2xl"
            onClick={() => {
              if (page === "Dashboard" || page === "Editor") {
                // ✅ Dashboard/Editor uses sidebar
                onMenuClick?.();
              } else {
                // ✅ Welcome/Main/Reader uses navbar drawer
                setMobileMenuOpen(true);
              }
            }}
            aria-label="Open menu"
          >
            ☰
          </button>

        </div>
      </nav>

      {/* ===== MOBILE SLIDE-IN MENU (FROM RIGHT) ===== */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-lg p-6 flex flex-col gap-6 transform transition-transform duration-300">
            {/* ✅ User section */}
            <div className="flex items-center gap-3">
              <InitialsAvatar name={displayName} size="lg" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {displayName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {displayEmail}
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="flex flex-col gap-4 text-sm">
              <NavLinks onClick={() => setMobileMenuOpen(false)} />
            </div>

            <div className="mt-auto">
              {!isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login", { state: { from: window.location.pathname } });
                  }}
                  className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                >
                  Get Started
                </button>
              ) : (
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    navigate(getLogoutRedirect(), { replace: true });
                  }}
                  className="w-full px-4 py-2 border rounded-md hover:bg-gray-100 transition font-medium text-gray-800"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
