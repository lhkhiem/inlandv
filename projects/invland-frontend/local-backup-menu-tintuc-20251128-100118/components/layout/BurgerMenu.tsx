"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { navigationTree, NavItem } from "./navigationData";

interface BurgerMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function BurgerMenu({ open, onClose }: BurgerMenuProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const activeItem: NavItem | null = useMemo(
    () => (hoveredIndex !== null ? navigationTree[hoveredIndex] : null),
    [hoveredIndex]
  );
  const showSub =
    !!activeItem && !!activeItem.children && activeItem.children.length > 0;

  // Handle navigation with hash/anchor
  const handleNavClick = (href: string) => {
    onClose();

    // Check if link has query param (?section=xxx)
    if (href.includes("?section=")) {
      // Let Next.js router handle query param navigation
      // NormalScrollNavigationHandler sẽ tự động xử lý scroll
      return; // Let Next.js Link handle it
    }

    // Check if link has hash (#xxx)
    const [path, hash] = href.split("#");

    if (hash) {
      // Nếu đang ở trên cùng trang, scroll ngay lập tức
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
      } else {
        // Navigate sang trang khác, hash sẽ được xử lý bởi NormalScrollNavigationHandler
        // Let Next.js router handle it - hash sẽ tự động được giữ trong URL
      }
    }
  };

  // Helper to Title Case each word for main menu
  // Locale-aware title case for Vietnamese; preserve separators
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

  // Helper to capitalize only first letter (Vietnamese-aware) and preserve acronyms
  const capitalizeFirst = (str: string) => {
    if (!str) return str;
    const lowered = str.toLocaleLowerCase("vi");
    const withFirst =
      lowered.charAt(0).toLocaleUpperCase("vi") + lowered.slice(1);
    return restoreAcronyms(withFirst);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[59]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel: 2/3 viewport width -> two columns each 1/3 */}
          <motion.aside
            initial={{ x: "-100%", width: "33.333vw" }}
            animate={{ x: 0, width: showSub ? "66.666vw" : "33.333vw" }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="fixed top-0 left-0 h-screen max-w-[960px] bg-white z-[60] shadow-2xl"
            aria-label="Site navigation"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Close */}
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={onClose}
                aria-label="Đóng menu"
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Columns */}
            <div
              className={`grid ${
                showSub ? "grid-cols-2" : "grid-cols-1"
              } h-full`}
            >
              {/* Left: Main menu (1/3 viewport inside panel) */}
              <div className="flex flex-col h-full border-r border-gray-200">
                <div className="px-6 pt-6 pb-2">
                  <span className="text-sm font-semibold tracking-wider text-gray-500">
                    MENU
                  </span>
                </div>
                <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                  {navigationTree.map((item, idx) => {
                    const isActive = idx === hoveredIndex;
                    const hasChildren =
                      !!item.children && item.children.length > 0;
                    return (
                      <div
                        key={item.title}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onFocus={() => setHoveredIndex(idx)}
                        className={`w-full flex items-center justify-between rounded-md px-3 py-2 transition-colors ${
                          isActive ? "bg-gray-100" : "hover:bg-gray-50"
                        }`}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isActive}
                      >
                        {item.href ? (
                          <Link
                            href={item.href}
                            onClick={() => handleNavClick(item.href!)}
                            className="flex-1 text-left"
                          >
                            <span className="text-base text-gray-800">
                              {viTitleCase(item.title)}
                            </span>
                          </Link>
                        ) : (
                          <span className="flex-1 text-left text-base text-gray-900">
                            {viTitleCase(item.title)}
                          </span>
                        )}
                        {hasChildren && (
                          <ChevronRight
                            className={`w-4 h-4 text-gray-500 ${
                              isActive ? "opacity-100" : "opacity-70"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </nav>
                {/* Brand logo near bottom */}
                <div className="px-6 pb-6 flex justify-center">
                  <img
                    src="/logo.png"
                    alt="INLANDV"
                    className="h-[52px] w-auto opacity-90"
                  />
                </div>
              </div>
              {/* Right: Submenu column */}
              {showSub && (
                <div className="h-full" onMouseEnter={() => {}}>
                  <div className="px-6 pt-6 pb-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold tracking-wide text-gray-600">
                      {viTitleCase(activeItem?.title || "")}
                    </h3>
                  </div>
                  <div className="h-[calc(100%-68px)] overflow-y-auto px-3 py-3">
                    <ul className="space-y-1">
                      {activeItem!.children!.map((child) => {
                        const hasGrand =
                          !!child.children && child.children.length > 0;
                        return (
                          <li key={child.title}>
                            {child.href && !hasGrand ? (
                              <Link
                                href={child.href}
                                onClick={() => handleNavClick(child.href!)}
                                className="group block rounded-md px-3 py-2 text-gray-800 hover:bg-gray-50 text-sm border-l-2 border-transparent hover:border-[#358b4e] transition-colors"
                              >
                                {capitalizeFirst(child.title)}
                              </Link>
                            ) : (
                              <div className="rounded-md px-3 py-2 text-gray-900 text-sm font-medium border-l-2 border-transparent">
                                {capitalizeFirst(child.title)}
                              </div>
                            )}
                            {hasGrand && (
                              <ul className="ml-4 mt-1 border-l border-gray-200 pl-3 space-y-1">
                                {child.children!.map((g) => (
                                  <li key={g.title}>
                                    {g.href ? (
                                      <Link
                                        href={g.href}
                                        onClick={() => handleNavClick(g.href!)}
                                        className="block rounded-md px-3 py-1.5 text-gray-700 hover:bg-gray-50 text-sm border-l-2 border-transparent hover:border-[#358b4e] transition-colors"
                                      >
                                        {capitalizeFirst(g.title)}
                                      </Link>
                                    ) : (
                                      <span className="block px-3 py-1.5 text-gray-700 text-sm">
                                        {capitalizeFirst(g.title)}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
