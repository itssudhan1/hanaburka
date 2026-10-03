"use client";

// A small visual flies from wherever "Add to Bag" was clicked to the
// cart icon in the navbar, then the cart icon gives a quick bump.
//
// This deliberately uses plain DOM APIs instead of React/Framer state:
// the product button and the navbar cart icon are unrelated component
// trees (the navbar is a separate server component rendered per-page),
// so there's no shared parent to hold "is flying" state without adding
// a global store just for one decorative effect. A vanishing, appended
// DOM node is the right scope for something this transient.
export function flyToCart(sourceEl: HTMLElement, imageUrl?: string) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // There are two cart icons in the DOM (desktop nav + mobile nav), only
  // one visible at a time via CSS — pick whichever actually has a size,
  // since the hidden one reports a zero-size rect at (0,0).
  const candidates = document.querySelectorAll<HTMLElement>("[data-cart-icon]");
  let foundTarget: HTMLElement | null = null;
  let foundRect: DOMRect | null = null;
  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      foundTarget = el;
      foundRect = rect;
      break;
    }
  }
  if (!foundTarget || !foundRect) return;
  // Reassigned to const so TypeScript can narrow these as non-null inside
  // the closures below — a `let` doesn't get that guarantee across a
  // requestAnimationFrame/setTimeout boundary.
  const target = foundTarget;
  const endRect = foundRect;

  const startRect = sourceEl.getBoundingClientRect();
  const size = 28;

  const flyer = document.createElement(imageUrl ? "img" : "div");
  if (imageUrl && flyer instanceof HTMLImageElement) {
    flyer.src = imageUrl;
    flyer.style.objectFit = "cover";
  } else {
    flyer.style.background = "#241C18"; // espresso, matches the brand palette
  }
  Object.assign(flyer.style, {
    position: "fixed",
    left: `${startRect.left + startRect.width / 2 - size / 2}px`,
    top: `${startRect.top + startRect.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "9999px",
    zIndex: "9999",
    pointerEvents: "none",
    boxShadow: "0 4px 14px rgba(36,28,24,0.35)",
    transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease-in",
  });
  document.body.appendChild(flyer);

  requestAnimationFrame(() => {
    const dx = endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
    const dy = endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);
    flyer.style.transform = `translate(${dx}px, ${dy}px) scale(0.25)`;
    flyer.style.opacity = "0.5";
  });

  setTimeout(() => {
    flyer.remove();
    target.classList.add("cart-bump");
    setTimeout(() => target.classList.remove("cart-bump"), 300);
  }, 620);
}
