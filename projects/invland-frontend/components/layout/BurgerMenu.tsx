"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { navigationTree, NavItem } from "./navigationData";

interface BurgerMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function BurgerMenu({ open, onClose }: BurgerMenuProps) {
  const pathname = usePathname();
  const currentFullPath = typeof window !== 'undefined' 
    ? pathname + window.location.search 
    : pathname;
  const currentPath = pathname.split('?')[0].trim();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expandedSubIndex, setExpandedSubIndex] = useState<{ parentIndex: number; subIndex: number } | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if portrait mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open && isPortrait) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, isPortrait]);

  // Handle navigation with hash/anchor
  const handleNavClick = (href: string) => {
    onClose();

    // Check if link has query param (?section=xxx)
    if (href.includes("?section=")) {
      return; // Let Next.js Link handle it
    }

    // Check if link has hash (#xxx)
    const [path, hash] = href.split("#");

    if (hash) {
      if (window.location.pathname === path) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            const headerHeight = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.pageYOffset - headerHeight;
            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }, 100);
      }
    }
  };

  // Toggle submenu expansion (main menu)
  const toggleSubmenu = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Toggle sub-submenu expansion (sub 1)
  const toggleSubSubmenu = (parentIndex: number, subIndex: number) => {
    const key = { parentIndex, subIndex };
    if (expandedSubIndex?.parentIndex === parentIndex && expandedSubIndex?.subIndex === subIndex) {
      setExpandedSubIndex(null);
    } else {
      setExpandedSubIndex(key);
    }
  };

  // Helper to Title Case each word for main menu
  const ACRONYMS = ["FDI", "INLANDV", "KCN", "BĐS", "CSR"];
  const restoreAcronyms = (s: string) => {
    let out = s;
    for (const a of ACRONYMS) {
      const re = new RegExp(a, "ig");
      out = out.replace(re, a);
    }
    return out;
  };

  const viTitleCase = (str: string) => {
    const cased = str
      .split(/([\s&\-/]+)/)
      .map((part) =>
        /^[\s&\-/]+$/.test(part)
          ? part
          : part.charAt(0).toLocaleUpperCase("vi") +
            part.slice(1).toLocaleLowerCase("vi")
      )
      .join("");
    return restoreAcronyms(cased);
  };

  const capitalizeFirst = (str: string) => {
    if (!str) return str;
    const lowered = str.toLocaleLowerCase("vi");
    const withFirst =
      lowered.charAt(0).toLocaleUpperCase("vi") + lowered.slice(1);
    return restoreAcronyms(withFirst);
  };

  if (!mounted || !isPortrait) return null;

  if (!open) return null;

  const menuContent = (
    <>
      {/* Full-screen backdrop */}
      <div
        className="burger-menu-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 9998,
          margin: 0,
          padding: 0,
        }}
      />

      {/* Menu container - full screen overlay */}
      <aside
        className="burger-menu-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#151313',
          overflow: 'hidden',
        }}
        aria-label="Site navigation"
      >
        {/* Header: Logo + Close button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            flexShrink: 0,
          }}
        >
          <Link
            href="/"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
            }}
          >
            <img
              src="/logo-1.png"
              alt="INLANDV"
              style={{
                height: '2rem',
                width: 'auto',
              }}
            />
          </Link>
          <button
            onClick={onClose}
            aria-label="Đóng menu"
            style={{
              padding: '0.5rem',
              color: 'rgba(255, 255, 255, 0.7)',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu content - scrollable */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {navigationTree.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const hasChildren = !!item.children && item.children.length > 0;

            // Check if current path matches this nav item or any of its children
            let isCurrentPage = false;
            if (item.href) {
              const itemPath = item.href.split('?')[0].trim();
              isCurrentPage = currentPath === itemPath && currentPath !== '' && itemPath !== '';
            }

            if (item.children) {
              for (const child of item.children) {
                if (child.href) {
                  if (currentFullPath === child.href || currentPath === child.href.split('?')[0].trim()) {
                    isCurrentPage = true;
                    break;
                  }
                }
                if (child.children) {
                  for (const grandchild of child.children) {
                    if (grandchild.href && currentFullPath === grandchild.href) {
                      isCurrentPage = true;
                      break;
                    }
                  }
                }
              }
            }

            return (
              <div key={item.title} style={{ width: '100%' }}>
                {/* Main menu item */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    cursor: hasChildren ? 'pointer' : 'default',
                    backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSubmenu(idx);
                    }
                  }}
                >
                  {item.href && !hasChildren ? (
                    <Link
                      href={item.href}
                      onClick={() => handleNavClick(item.href!)}
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        textDecoration: 'none',
                        fontSize: '1.125rem',
                        fontWeight: isCurrentPage ? 600 : 500,
                        color: isCurrentPage ? '#2E8C4F' : '#ffffff',
                      }}
                    >
                      {viTitleCase(item.title)}
                    </Link>
                  ) : (
                    <span
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        fontSize: '1.125rem',
                        fontWeight: isCurrentPage ? 600 : 500,
                        color: isCurrentPage ? '#2E8C4F' : '#ffffff',
                      }}
                    >
                      {viTitleCase(item.title)}
                    </span>
                  )}
                  {hasChildren && (
                    <ChevronDown
                      size={16}
                      style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  )}
                </div>

                {/* Submenu - expandable */}
                {isExpanded && hasChildren && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      marginLeft: '1rem',
                      paddingLeft: '1rem',
                      borderLeft: '2px solid rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    {item.children!.map((child, childIdx) => {
                      const hasGrand = !!child.children && child.children.length > 0;
                      const isSubExpanded = expandedSubIndex?.parentIndex === idx && expandedSubIndex?.subIndex === childIdx;
                      // Kiểm tra xem main menu này có sub 2 level không (chỉ KCN có)
                      const hasTwoLevelSubs = item.children!.some(c => !!c.children && c.children.length > 0);

                      let hasActiveGrandchild = false;
                      if (child.children) {
                        for (const g of child.children) {
                          if (g.href && currentFullPath === g.href) {
                            hasActiveGrandchild = true;
                            break;
                          }
                        }
                      }

                      const isChildActive = !hasActiveGrandchild && child.href && (
                        currentFullPath === child.href ||
                        (currentPath === child.href.split('?')[0].trim() && !child.href.includes('?'))
                      );

                      // Style cho sub 1 level (dùng cho sub của các main không có 2 level, và sub 1 của KCN)
                      const sub1Style = {
                        fontSize: '1rem',
                        fontWeight: isChildActive ? 600 : 500,
                        color: isChildActive ? '#2E8C4F' : '#ffffff',
                      };

                      return (
                        <div key={child.title} style={{ padding: '0.25rem 0' }}>
                          {/* Sub 1 - chỉ click để expand/collapse sub 2, không navigate (chỉ KCN) */}
                          {hasGrand ? (
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSubSubmenu(idx, childIdx);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.375rem',
                                ...sub1Style,
                                cursor: 'pointer',
                                backgroundColor: isSubExpanded ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                transition: 'background-color 0.2s',
                              }}
                            >
                              <span>{capitalizeFirst(child.title)}</span>
                              <ChevronDown
                                size={14}
                                style={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  transform: isSubExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s',
                                }}
                              />
                            </div>
                          ) : child.href ? (
                            // Sub của các main không có 2 level, hoặc "Đặt hàng" trong KCN
                            <Link
                              href={child.href}
                              onClick={() => handleNavClick(child.href!)}
                              style={{
                                display: 'block',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.375rem',
                                textDecoration: 'none',
                                ...sub1Style,
                                backgroundColor: isChildActive ? 'rgba(46, 140, 79, 0.1)' : 'transparent',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                if (!isChildActive) {
                                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isChildActive) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              {capitalizeFirst(child.title)}
                            </Link>
                          ) : (
                            <div
                              style={{
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.375rem',
                                ...sub1Style,
                              }}
                            >
                              {capitalizeFirst(child.title)}
                            </div>
                          )}
                          {/* Sub 2 - chỉ hiển thị khi sub 1 được expanded */}
                          {hasGrand && isSubExpanded && (
                            <div
                              style={{
                                marginLeft: '1rem',
                                marginTop: '0.25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                              }}
                            >
                              {child.children!.map((g) => {
                                const isGrandchildActive = g.href && currentFullPath === g.href;

                                return (
                                  <div key={g.title}>
                                    {g.href ? (
                                      <Link
                                        href={g.href}
                                        onClick={() => handleNavClick(g.href!)}
                                        style={{
                                          display: 'block',
                                          padding: '0.375rem 0.75rem',
                                          borderRadius: '0.375rem',
                                          textDecoration: 'none',
                                          fontSize: '0.875rem',
                                          fontWeight: isGrandchildActive ? 600 : 400,
                                          color: isGrandchildActive ? '#2E8C4F' : 'rgba(255, 255, 255, 0.7)',
                                          backgroundColor: isGrandchildActive ? 'rgba(46, 140, 79, 0.1)' : 'transparent',
                                          transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isGrandchildActive) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isGrandchildActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                          }
                                        }}
                                      >
                                        {capitalizeFirst(g.title)}
                                      </Link>
                                    ) : (
                                      <span
                                        style={{
                                          display: 'block',
                                          padding: '0.375rem 0.75rem',
                                          fontSize: '0.875rem',
                                          fontWeight: isGrandchildActive ? 600 : 400,
                                          color: isGrandchildActive ? '#2E8C4F' : 'rgba(255, 255, 255, 0.7)',
                                        }}
                                      >
                                        {capitalizeFirst(g.title)}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );

  // Render to body using portal
  if (typeof window === 'undefined') return null;
  return createPortal(menuContent, document.body);
}
