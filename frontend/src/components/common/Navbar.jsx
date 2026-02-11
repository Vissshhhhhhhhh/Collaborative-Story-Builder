import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "../BrandLogo";
import ProfileModal from "./ProfileModal";

/* ✅ Build initials: "Viswanath" -> V, "Viswanath Paarthiban" -> VP */
function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";

  const first = parts[0][0]?.toUpperCase() || "";
  const last = parts[parts.length - 1][0]?.toUpperCase() || "";
  return first + last || "U";
}

/* ✅ Soft background color based on name (stable, no libs) */
function getAvatarColor(name) {
  const str = name || "user";
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);

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

function Navbar({ onMenuClick = () => {}, page, onMobileMenuChange }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ Profile popup modal
  const [profileOpen, setProfileOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Notify parent when mobile menu state changes
  useEffect(() => {
    if (onMobileMenuChange) {
      onMobileMenuChange(mobileMenuOpen);
    }
  }, [mobileMenuOpen, onMobileMenuChange]);

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

  const displayName = useMemo(() => {
    if (!isAuthenticated) return "Guest";
    return user?.name || "User";
  }, [isAuthenticated, user?.name]);

  const displayEmail = useMemo(() => {
    if (!isAuthenticated) return "Not logged in";
    return user?.email || "";
  }, [isAuthenticated, user?.email]);

  /* Common nav links */
  const NavLinks = ({ onClick }) => (
    <>
      <NavLink
        to="/"
        onClick={onClick}
        className={({ isActive }) =>
          isActive ? "text-black font-medium" : "text-gray-600 hover:text-black"
        }
      >
        Discover
      </NavLink>

      <NavLink
        to="/main"
        onClick={onClick}
        className={({ isActive }) =>
          isActive ? "text-black font-medium" : "text-gray-600 hover:text-black"
        }
      >
        Explore
      </NavLink>

      {/* ✅ Always show Dashboard */}
      <button
        type="button"
        onClick={() => {
          onClick?.();
          if (!isAuthenticated) {
            navigate("/login", { state: { from: "/dashboard" } });
            return;
          }
          navigate("/dashboard");
        }}
        className={`${
          window.location.pathname.startsWith("/dashboard")
            ? "text-black font-medium"
            : "text-gray-600 hover:text-black"
        }`}
      >
        Dashboard
      </button>
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

            {/* ✅ Logged OUT */}
            {!isAuthenticated ? (
              <div className="ml-4 flex items-center gap-3">
                {/* ✅ Profile -> redirect to login */}
                <button
                  onClick={() =>
                    navigate("/login", {
                      state: { from: window.location.pathname },
                    })
                  }
                  className="px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition font-medium"
                >
                  Profile
                </button>

                <button
                  onClick={() =>
                    navigate("/login", {
                      state: { from: window.location.pathname },
                    })
                  }
                  className="px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition font-medium"
                >
                  Get Started
                </button>
              </div>
            ) : (
              /* ✅ Logged IN */
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
                      {/* ✅ Profile opens modal */}
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          setProfileOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition mb-2"
                      >
                        Profile
                      </button>

                      <button
                        onClick={async () => {
                          setDropdownOpen(false);
                          await logout();
                          navigate("/", { replace: true });
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

          {/* ✅ Mobile menu button */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

        </div>
      </nav>

      {/* ===== MOBILE SLIDE-IN MENU (FROM RIGHT) ===== */}
      {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMobileMenuOpen(false)}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Drawer */}
            <div
              className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 shadow-xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
            {/* ✅ Header */}
            <div className="px-5 pt-20 pb-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <InitialsAvatar name={displayName} size="lg" />

                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Signed in as</p>

                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {displayName}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    {displayEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-2xl text-gray-700"
              >
                ✕
              </button>

            </div>





              {/* ✅ Links */}
              <div className="flex-1 p-5">
                <div className="flex flex-col gap-4 text-sm font-medium">
                  <NavLink
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "text-gray-900 font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }
                  >
                    Discover
                  </NavLink>

                  <NavLink
                    to="/main"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "text-gray-900 font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }
                  >
                    Explore
                  </NavLink>

                  {/* ✅ Dashboard */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);

                      if (!isAuthenticated) {
                        navigate("/login", {
                          state: { from: window.location.pathname },
                        });
                      } else {
                        navigate("/dashboard");
                      }
                    }}
                    className="text-left text-gray-600 hover:text-gray-900"
                  >
                    Dashboard
                  </button>

                  {/* ✅ Profile */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);

                      if (!isAuthenticated) {
                        navigate("/login", {
                          state: { from: window.location.pathname },
                        });
                      } else {
                        setProfileOpen(true);
                      }
                    }}
                    className="text-left text-gray-600 hover:text-gray-900"
                  >
                    Profile
                  </button>
                </div>
              </div>

              {/* ✅ Bottom Action */}
              <div className="p-5 border-t border-gray-200">
                {!isAuthenticated ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/login", {
                        state: { from: window.location.pathname },
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition"
                  >
                    Get Started
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                      navigate("/", { replace: true });
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}


      {/* ✅ Profile Modal Popup */}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onConfirm={(data) => {
          console.log("Profile update:", data);
          setProfileOpen(false);
        }}
      />
    </>
  );
}

export default Navbar;
