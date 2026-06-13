/** Reusable responsive layout values — keeps design, adapts spacing/grids only */

export function pagePadding(bp) {
  if (bp.isMobile) return "16px";
  if (bp.isTablet) return "24px";
  return "36px";
}

export function pagePaddingY(bp) {
  if (bp.isMobile) return "24px";
  return "36px";
}

export function headerPadding(bp) {
  if (bp.isMobile) return "0 16px";
  if (bp.isTablet) return "0 24px";
  return "0 36px";
}

export function sidebarWidth(bp) {
  return bp.isMobile ? "min(86vw, 300px)" : "270px";
}

export function mainOffset(bp, sidebarOpen = false) {
  if (bp.isMobile) return 0;
  return 270;
}

export function statsGridCols(bp, desktop = 4, tablet = 2, mobile = 2) {
  if (bp.isMobile) return `repeat(${mobile}, 1fr)`;
  if (bp.isTablet) return `repeat(${tablet}, 1fr)`;
  return `repeat(${desktop}, 1fr)`;
}

export function cardsGridCols(bp, desktop = 3, tablet = 2, mobile = 1) {
  if (bp.isMobile) return `repeat(${mobile}, 1fr)`;
  if (bp.isTablet) return `repeat(${tablet}, 1fr)`;
  return `repeat(${desktop}, 1fr)`;
}

export function autoFillGrid(minPx, bp) {
  const min = bp.isMobile ? Math.min(minPx, 260) : minPx;
  return `repeat(auto-fill, minmax(${min}px, 1fr))`;
}

export function filterBarGrid(bp, cols = 4) {
  if (bp.isMobile) return "1fr";
  if (bp.isTablet) return "1fr 1fr";
  if (cols <= 2) return "1fr auto";
  if (cols === 3) return "1fr auto auto";
  if (cols >= 5) return "1fr auto auto auto auto";
  return "1fr auto auto auto";
}

export function formGridCols(bp, desktop = 2) {
  if (bp.isMobile) return "1fr";
  return `repeat(${desktop}, 1fr)`;
}

export function formGridCols3(bp) {
  if (bp.isMobile) return "1fr";
  if (bp.isTablet) return "1fr 1fr";
  return "1fr 1fr 1fr";
}

export function heroTitleSize(bp) {
  if (bp.isMobile) return "26px";
  if (bp.isTablet) return "30px";
  return "36px";
}

export function sectionTitleSize(bp) {
  if (bp.isMobile) return "22px";
  return "28px";
}

export function modalPadding(bp) {
  if (bp.isMobile) return "20px";
  return "32px";
}

export function touchMinHeight() {
  return 44;
}

export function pageShellPadding(bp) {
  if (bp.isMobile) return "24px 16px";
  if (bp.isTablet) return "32px 24px";
  return "36px 24px";
}

export function bloodFilterGrid(bp) {
  if (bp.isMobile) return "1fr";
  if (bp.isTablet) return "1fr 1fr";
  return "2fr 1fr 1fr 1fr 1fr auto";
}

export function splitSidebarGrid(bp, fixedPx = 360) {
  if (bp.isMobile || bp.isTablet) return "1fr";
  return `${fixedPx}px 1fr`;
}

export function statsAutoGrid(bp, minPx = 200) {
  const min = bp.isMobile ? Math.min(minPx, 150) : minPx;
  return `repeat(auto-fit, minmax(${min}px, 1fr))`;
}
