import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

// Smooth, eased scrolling for the whole site (Lenis).
//   - Off for the admin screens, which are full of panels that scroll on their own.
//   - Off for people who ask for reduced motion: the browser scrolls as normal.
//   - allowNestedScroll lets menus, drawers and other scrolling boxes keep
//     scrolling by themselves, instead of moving the page behind them.
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const { pathname } = useLocation();
  const smooth = !reduce && !pathname.startsWith("/admin");

  return (
    <ReactLenis
      root
      options={{ lerp: 0.1, smoothWheel: smooth, allowNestedScroll: true }}
    >
      {children}
    </ReactLenis>
  );
}