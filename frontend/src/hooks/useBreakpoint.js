import { useEffect, useState } from "react";

const QUERIES = {
  isMobile: "(max-width: 767px)",
  isTablet: "(min-width: 768px) and (max-width: 1023px)",
  isDesktop: "(min-width: 1024px)",
  isWide: "(min-width: 1440px)",
};

export function useBreakpoint() {
  const getMatches = () => {
    if (typeof window === "undefined") {
      return { isMobile: false, isTablet: false, isDesktop: true, isWide: false, width: 1280 };
    }
    return {
      isMobile: window.matchMedia(QUERIES.isMobile).matches,
      isTablet: window.matchMedia(QUERIES.isTablet).matches,
      isDesktop: window.matchMedia(QUERIES.isDesktop).matches,
      isWide: window.matchMedia(QUERIES.isWide).matches,
      width: window.innerWidth,
    };
  };

  const [bp, setBp] = useState(getMatches);

  useEffect(() => {
    const update = () => setBp(getMatches());
    window.addEventListener("resize", update);
    const mediaLists = Object.values(QUERIES).map((q) => window.matchMedia(q));
    mediaLists.forEach((mql) => mql.addEventListener("change", update));
    return () => {
      window.removeEventListener("resize", update);
      mediaLists.forEach((mql) => mql.removeEventListener("change", update));
    };
  }, []);

  return bp;
}

export default useBreakpoint;
