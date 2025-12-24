"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Normal Scroll Navigation Handler
 *
 * Xử lý navigation cho trang normal scroll (không dùng FullpageScroll):
 * - Hash navigation: /tin-tuc-hoat-dong#tin-fdi
 * - Query param navigation: /tin-tuc-hoat-dong?section=thi-truong-bds
 *
 * Tự động scroll smooth đến section với offset cho header
 */
export default function NormalScrollNavigationHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const scrollToElement = (elementId: string) => {
      // Delay để đảm bảo DOM đã render và animation có thể chạy
      setTimeout(() => {
        const element = document.getElementById(elementId);

        if (element) {
          // Lấy chiều cao header (fixed header có height 80px)
          const headerHeight = 80;

          // Tính toán vị trí scroll với offset
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerHeight;

          // Scroll smooth đến vị trí
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 300); // Delay 300ms để đảm bảo animation chạy được
    };

    const handleNavigation = () => {
      // Priority 1: Check hash navigation (#tin-fdi)
      const hash = window.location.hash.slice(1); // Remove '#'

      // Priority 2: Check query param navigation (?section=thi-truong-bds)
      const sectionParam = searchParams.get("section");

      // Hash có priority cao hơn query param
      const targetId = hash || sectionParam;

      if (targetId) {
        scrollToElement(targetId);
      }
    };

    // Chạy khi mount hoặc khi pathname/searchParams thay đổi
    handleNavigation();
  }, [pathname, searchParams]);

  // Listen cho hash change (khi click vào link hash trên cùng một trang)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
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
        }, 100); // Delay ngắn hơn cho hash change vì đã ở trên trang rồi
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return null;
}
