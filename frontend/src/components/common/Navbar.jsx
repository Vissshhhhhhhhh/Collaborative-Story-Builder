import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "../BrandLogo";

/* 10 default avatars (frontend only) */
const defaultAvatars = Array.from(
  { length: 10 },
  (_, i) => `https://api.dicebear.com/7.x/thumbs/svg?seed=user${i}`
);

function Navbar({ onMenuClick =()=>{}, page}) {
  const navigate = useNavigate();
  const { isAuthenticated, logout ,user} = useAuth();

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

      {isAuthenticated && (
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
      )}

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
      <nav className="fixed top-0 left-0 h-16 w-full bg-white flex items-center px-6 z-50">
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
                onClick={() => navigate("/login")}
                className="ml-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
              >
                Get Started
              </button>
            ) : (
              <div className="relative ml-4" ref={dropdownRef}>
                <img
                  src={defaultAvatars[0]}
                  alt="Profile"
                  className="w-9 h-9 rounded-full cursor-pointer border"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                />

                  {dropdownOpen && (
                    <div className="h-50 absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-1xl shadow-xl overflow-hidden">
                      <div className="flex items-center gap-3 px-5 py-4 border-b">
                        <img
                          src={defaultAvatars[0]}
                          alt="Profile"
                          className="w-11 h-11 rounded-full border"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user?.email || ""}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          setDropdownOpen(false);
                          await logout();
                          navigate("/login");
                        }}
                        className="w-full py-3 text-sm bottom-0 font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}

              </div>
            )}
          </div>

          {/* ✅ Mobile menu button (opens DashboardSidebar) */}
          {(page === "Dashboard" || page==="Editor") ? (
               <button className="md:hidden text-2xl" onClick={() => setMobileMenuOpen(true)}>
                 ☰
               </button>
          ):(
               <button className="md:hidden text-2xl" onClick={onMenuClick}>
                  ☰
               </button>
          )
          }
         
        </div>
      </nav>

      {/* ===== MOBILE SLIDE-IN MENU (FROM RIGHT) ===== */}
      {/* NOTE: This part is not used now because hamburger is opening sidebar,
          but keeping your old code safely (no harm). */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-lg p-6 flex flex-col gap-6 transform transition-transform duration-300">
            <div className="flex items-center gap-3 mb-6">
              <img
                src={defaultAvatars[0]}
                alt="Profile"
                className="w-10 h-10 rounded-full border"
              />
              <div className="text-sm font-medium text-gray-800">
                Username
              </div>
            </div>

            <div className="flex flex-col gap-4 text-sm">
              <NavLinks onClick={() => setMobileMenuOpen(false)} />
            </div>

            <div className="mt-auto">
              {!isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
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
                    navigate("/login");
                  }}
                  className="w-full px-4 py-2 border rounded-md hover:bg-gray-100"
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
