import { icons as ms } from "@iconify-json/material-symbols";
import { getIconData, iconToHTML, iconToSVG, replaceIDs } from "@iconify/utils";

function iconSvg(name: string): string {
  const data = getIconData(ms, name);
  if (!data) return "";
  const r = iconToSVG(data, { height: "1em", width: "1em" });
  return iconToHTML(replaceIDs(r.body), { ...r.attributes });
}

function initLightbox() {
  let overlay: HTMLDivElement | null = null;
  let scale = 1;
  let rotation = 0;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOrigX = 0;
  let dragOrigY = 0;
  const SCALE_STEP = 0.25;
  const MIN_SCALE = 0.25;
  const MAX_SCALE = 3;

  function applyTransform(img: HTMLImageElement, hintEl?: HTMLElement | null) {
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotation}deg)`;
    if (hintEl) {
      hintEl.textContent = `${Math.round(scale * 100)}%`;
      hintEl.classList.add("visible");
      clearTimeout((hintEl as any)._timeout);
      (hintEl as any)._timeout = setTimeout(() => hintEl.classList.remove("visible"), 1000);
    }
  }

  function open(src: string, name: string) {
    if (overlay) return;

    scale = 1;
    rotation = 0;
    translateX = 0;
    translateY = 0;

    overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";

    const wrapper = document.createElement("div");
    wrapper.className = "lightbox-img-wrapper";

    const img = document.createElement("img");
    img.className = "lightbox-img";
    img.src = src;
    img.alt = name;
    img.draggable = false;

    const zoomHint = document.createElement("div");
    zoomHint.className = "lightbox-zoom-hint";

    const nameEl = document.createElement("p");
    nameEl.className = "lightbox-name";
    nameEl.textContent = name;

    const topbar = document.createElement("div");
    topbar.className = "lightbox-topbar";

    const buttons: { label: string; icon: string; action: () => void }[] = [
      { label: "放大", icon: iconSvg("zoom-in"), action: () => zoomIn() },
      { label: "缩小", icon: iconSvg("zoom-out"), action: () => zoomOut() },
      { label: "旋转", icon: iconSvg("rotate-right"), action: () => rotate() },
      { label: "下载", icon: iconSvg("download"), action: () => download() },
    ];

    for (const btn of buttons) {
      const el = document.createElement("button");
      el.className = "lightbox-topbar-btn";
      el.setAttribute("aria-label", btn.label);
      el.innerHTML = btn.icon;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        btn.action();
      });
      topbar.appendChild(el);
    }

    const closeBtn = document.createElement("button");
    closeBtn.className = "lightbox-close";
    closeBtn.innerHTML = iconSvg("close");
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      close();
    });
    topbar.appendChild(closeBtn);

    function download() {
      const a = document.createElement("a");
      a.href = img.src;
      a.download = name;
      a.click();
    }

    function zoomIn() {
      if (scale >= MAX_SCALE) return;
      scale = Math.min(MAX_SCALE, scale + SCALE_STEP);
      applyTransform(img, zoomHint);
    }

    function zoomOut() {
      if (scale <= MIN_SCALE) return;
      scale = Math.max(MIN_SCALE, scale - SCALE_STEP);
      applyTransform(img, zoomHint);
    }

    function rotate() {
      rotation = (rotation + 90) % 360;
      applyTransform(img, zoomHint);
    }

    // mouse drag
    wrapper.addEventListener("mousedown", (e) => {
      if ((e.target as HTMLElement).tagName === "BUTTON") return;
      e.preventDefault();
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragOrigX = translateX;
      dragOrigY = translateY;
      wrapper.classList.add("dragging");
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      translateX = dragOrigX + (e.clientX - dragStartX);
      translateY = dragOrigY + (e.clientY - dragStartY);
      applyTransform(img, zoomHint);
    });

    window.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      wrapper.classList.remove("dragging");
    });

    // ctrl+scroll zoom
    wrapper.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
          if (scale < MAX_SCALE) {
            scale = Math.min(MAX_SCALE, scale + SCALE_STEP);
            applyTransform(img, zoomHint);
          }
        } else {
          if (scale > MIN_SCALE) {
            scale = Math.max(MIN_SCALE, scale - SCALE_STEP);
            applyTransform(img, zoomHint);
          }
        }
      },
      { passive: false },
    );

    wrapper.appendChild(zoomHint);
    wrapper.appendChild(img);
    wrapper.appendChild(nameEl);
    overlay.appendChild(wrapper);
    overlay.appendChild(topbar);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (!overlay) return;
    isDragging = false;
    overlay.remove();
    overlay = null;
    document.body.style.overflow = "";
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") close();
  }

  document.addEventListener("keydown", handleKeydown);

  // Click handler for note images — skip gallery cards and lightbox internals
  document.addEventListener("click", (e) => {
    const img = (e.target as HTMLElement).closest("img");
    if (!img) return;
    // Don't intercept gallery page images (gallery has its own lightbox)
    if (img.closest(".gallery-card-link")) return;
    // Don't intercept images already in a lightbox
    if (img.closest(".lightbox-overlay")) return;
    // Only handle images inside note content
    if (!img.closest(".markdown-preview-view")) return;

    e.preventDefault();
    e.stopPropagation();
    const src = img.getAttribute("src") || img.dataset.src || "";
    const name = img.getAttribute("alt") || "";
    if (src) open(src, name);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLightbox);
} else {
  initLightbox();
}

export default "";
