import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, X, ChevronDown } from "lucide-react";
import { publicNavigation } from "@/config/publicNavigation";

const NAV_ITEMS = publicNavigation;

const NAV_COLORS = {
  bg: "var(--color-ink)",
  border: "#2A3631",
  text: "#B7BFB8",
  textActive: "#FFFFFF",
  textBrand: "#FFFFFF",
  dropdownBg: "#151A18",
};

// Previously some routes were hidden by default. Keep this empty so navbar shows on all pages
// except where the top-level app explicitly skips it (e.g., /student-desk).
const HIDDEN_PREFIXES = [];

function isHiddenPath(pathname) {
  return HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

export default function NavBar({ showOnLanding = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileOpenLabel, setMobileOpenLabel] = useState(null);
  const router = useRouter();
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    if (!activeDropdown) return;
    const onClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target))
        setActiveDropdown(null);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActiveDropdown(null);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeDropdown]);

  // Close everything on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setActiveDropdown(null);
      setMobileOpenLabel(null);
      setOpen(false);
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events]);

  const isDashboard = isHiddenPath(router.pathname);
  const isLandingHidden = router.pathname === "/" && !showOnLanding;

  if (isDashboard || isLandingHidden) return null;

  return (
    <>
      <nav
        ref={navRef}
        className="site-navbar site-navbar--dark"
        style={{
          position: "relative",
          zIndex: 60,
          background: NAV_COLORS.bg,
          borderBottom: `1px solid ${NAV_COLORS.border}`,
          boxShadow: scrolled ? "0 8px 24px rgba(0,0,0,0.18)" : "none",
          transition: "box-shadow .2s ease",
        }}
      >
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-[64px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "var(--color-accent)",
                color: "var(--color-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              N
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-serif text-[16px]" style={{ color: NAV_COLORS.textBrand }}>
                Notes Cafe
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? router.pathname === "/"
                  : router.pathname.startsWith(item.href);

              if (!item.children) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="site-navbar__link text-[14px] font-medium transition-colors"
                    style={{
                      color: isActive ? NAV_COLORS.textActive : NAV_COLORS.text,
                    }}
                  >
                    {item.label}
                  </Link>
                );
              }

              const isOpen = activeDropdown === item.label;

              return (
                <div key={item.href} className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(isOpen ? null : item.label)
                    }
                    className="site-navbar__dropdown-btn text-[14px] font-medium flex items-center gap-1 transition-colors"
                    style={{
                      color:
                        isActive || isOpen
                          ? NAV_COLORS.textActive
                          : NAV_COLORS.text,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown
                      size={14}
                      strokeWidth={1.6}
                      style={{
                        transition: "transform .15s ease",
                        transform: isOpen ? "rotate(180deg)" : "none",
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 10px)",
                        left: 0,
                        minWidth: 220,
                        padding: "8px",
                        display: "flex",
                        flexDirection: "column",
                        background: NAV_COLORS.dropdownBg,
                        border: `1px solid ${NAV_COLORS.border}`,
                        borderRadius: 10,
                        boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
                        zIndex: 70,
                      }}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setActiveDropdown(null)}
                          className="site-navbar__dropdown-link text-[14px] transition-colors"
                          style={{
                            padding: "8px 10px",
                            borderRadius: 6,
                            color: NAV_COLORS.text,
                          }}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="site-navbar__link text-[14px] font-medium transition-colors"
              style={{ color: NAV_COLORS.text }}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="btn btn-primary"
              style={{ padding: "0.5rem 1rem", fontSize: 13 }}
            >
              Sign Up
            </Link>
          </div>

          <button
            className="site-navbar__toggle lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            style={{
              background: "transparent",
              border: "none",
              color: NAV_COLORS.textActive,
            }}
          >
            {open ? (
              <X size={20} strokeWidth={1.4} />
            ) : (
              <Menu size={20} strokeWidth={1.4} />
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div
            className="lg:hidden"
            style={{
              background: NAV_COLORS.bg,
              borderTop: `1px solid ${NAV_COLORS.border}`,
              maxHeight: "calc(100vh - 64px)",
              overflowY: "auto",
            }}
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isMobileOpen = mobileOpenLabel === item.label;

                return (
                  <div key={item.href} className="flex flex-col">
                    {item.children ? (
                      <button
                        onClick={() =>
                          setMobileOpenLabel(isMobileOpen ? null : item.label)
                        }
                        className="py-2 text-[15px] flex items-center justify-between w-full text-left"
                        style={{
                          color: NAV_COLORS.textActive,
                          background: "transparent",
                          border: "none",
                        }}
                      >
                        {item.label}
                        <ChevronDown
                          size={16}
                          strokeWidth={1.6}
                          style={{
                            transition: "transform .15s ease",
                            transform: isMobileOpen ? "rotate(180deg)" : "none",
                          }}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="site-navbar__drawer-link py-2 text-[15px] transition-colors"
                        style={{ color: NAV_COLORS.textActive }}
                      >
                        {item.label}
                      </Link>
                    )}

                    {item.children && isMobileOpen && (
                      <div className="pl-2 pb-2 flex flex-col">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="site-navbar__drawer-link py-1.5 text-sm transition-colors"
                            style={{ color: NAV_COLORS.text }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="my-2" style={{ borderTop: `1px solid ${NAV_COLORS.border}` }} />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="btn btn-ghost justify-center"
                style={{ color: NAV_COLORS.textActive, borderColor: NAV_COLORS.border }}
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="btn btn-primary justify-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
