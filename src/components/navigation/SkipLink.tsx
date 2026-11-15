import type { MouseEvent } from "react";

// The first thing a keyboard user reaches: a way past the menu, straight to the
// page's content. It stays out of sight until it receives focus.
export default function SkipLink() {
  const goToContent = (event: MouseEvent<HTMLAnchorElement>) => {
    const main = document.querySelector("main");
    if (!main) return;
    event.preventDefault();
    main.setAttribute("tabindex", "-1");
    main.focus();
  };

  return (
    <a
      href="#main-content"
      onClick={goToContent}
      className="sr-only fixed left-4 top-4 z-[200] bg-ivory px-5 py-3 font-sans text-body-s font-medium text-ink focus:not-sr-only"
    >
      Skip to main content
    </a>
  );
}