import { sections } from "./data.js";
let activeKey = null;
let carouselCleanups = [];
const CAROUSEL_INTERVAL = 4200;
const MIN_CARD_H = 260;
const THUMB_DIR = "/images/portfolio/thumbs/";
export const isModalOpen = () =>
    document.getElementById("modal").classList.contains("open");
const esc = (value) =>
    String(value ?? "").replace(
        /[&<>"']/g,
        (c) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[c],
    );
const THUMB_WIDTHS = [640, 1280, 1920];
const DEFAULT_WIDTH = 1280;
const thumbPath = (src, width) => {
    const rel = String(src)
        .replace(/^\/?images\/portfolio\//, "")
        .replace(/\.[^.]+$/, "");
    return `${THUMB_DIR}${rel}-${width}.webp`;
};
function srcAttrs(src, sizes, deferred = false) {
    if (/^https?:\/\//i.test(src)) {
        return `${deferred ? "data-src" : "src"}="${esc(src)}"`;
    }
    const main = esc(thumbPath(src, DEFAULT_WIDTH));
    const set = esc(
        THUMB_WIDTHS.map((w) => `${thumbPath(src, w)} ${w}w`).join(", "),
    );
    return deferred
        ? `data-src="${main}" data-srcset="${set}" sizes="${sizes}"`
        : `src="${main}" srcset="${set}" sizes="${sizes}"`;
}
const fallback = (src) =>
    `onerror="this.onerror=null;this.removeAttribute('srcset');this.src='${esc(src)}'"`;
function renderTitle(el, text) {
    const frag = document.createDocumentFragment();
    text.split(" ").forEach((word, i) => {
        if (i > 0) frag.append(" ");
        const first = word.charAt(0);
        if (/\p{L}/u.test(first)) {
            const cap = document.createElement("span");
            cap.className = "title-cap";
            cap.textContent = first;
            frag.append(cap, word.slice(1));
        } else {
            frag.append(word);
        }
    });
    el.replaceChildren(frag);
}
function slideState(offset, total) {
    if (offset === 0) return "front";
    if (offset === 1) return "next";
    if (offset === total - 1 && total > 2) return "back";
    return "hidden";
}
function renderCard(sec, item, index = 0) {
    const sources = item.images?.length
        ? item.images
        : item.image
          ? [item.image]
          : [];
    const hasImage = sources.length > 0;
    const multi = sources.length > 1;
    const imageOnly = Boolean(sec.imageOnly && hasImage);
    const projectCard = sec.variant === "project" && !hasImage;
    const alt = esc(item.alt ?? item.title ?? "");
    const lazy = sec.justified ? "" : ' loading="lazy"';
    const sizes = sec.justified
        ? "(max-width: 640px) 100vw, 50vw"
        : "(max-width: 640px) 100vw, 480px";
    const classes = [
        "item-card",
        hasImage ? "has-image" : "",
        imageOnly ? "image-only" : "",
        multi ? "has-carousel" : "",
        projectCard ? "project-card" : "",
    ]
        .filter(Boolean)
        .join(" ");
    let media = "";
    if (multi) {
        const total = sources.length;
        const slides = sources
            .map((src, i) => {
                const label = i === 0 ? alt : `${alt} (${i + 1})`;
                const source =
                    srcAttrs(src, sizes, i > 0) + (i === 0 ? lazy : "");
                return `<img class="item-card-img item-card-slide" data-pos="${slideState(i, total)}" ${source} ${fallback(src)} alt="${label}" decoding="async">`;
            })
            .join("");
        const dots = sources
            .map(
                (_, i) =>
                    `<button type="button" class="item-card-dot${i === 0 ? " active" : ""}" aria-label="Foto ${i + 1} dari ${total}"></button>`,
            )
            .join("");
        media = `<div class="item-card-stack">${slides}</div><div class="item-card-dots">${dots}</div>`;
    } else if (hasImage) {
        media = `<img class="item-card-img" ${srcAttrs(sources[0], sizes)} ${fallback(sources[0])} alt="${alt}" decoding="async"${lazy}>`;
    }
    const stack = item.stack?.length
        ? `<ul class="project-stack">${item.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`
        : "";
    const link = item.link
        ? `<a class="project-link" href="${esc(item.link)}" target="_blank" rel="noopener noreferrer">Lihat proyek ↗</a>`
        : "";
    let body = "";
    if (projectCard) {
        body = `<div class="item-card-body">
            <div class="project-head">
                <span class="project-index">${String(index + 1).padStart(2, "0")}</span>
                <span class="item-card-tag">${esc(item.tag)}</span>
            </div>
            <div class="item-card-title">${esc(item.title)}</div>
            <div class="item-card-desc">${esc(item.desc)}</div>
            ${stack}${link}
        </div>`;
    } else if (!imageOnly) {
        body = `<div class="item-card-body">
            <div class="item-card-tag">${esc(item.tag)}</div>
            <div class="item-card-title">${esc(item.title)}</div>
            <div class="item-card-desc">${esc(item.desc)}</div>
            ${stack}${link}
        </div>`;
    }
    return `<article class="${classes}">${media}${body}</article>`;
}
function applyImageRatios(grid) {
    grid.querySelectorAll(".item-card").forEach((card) => {
        const img = card.querySelector(".item-card-img");
        if (!img) return;
        const apply = () => {
            if (img.naturalWidth && img.naturalHeight) {
                card.style.setProperty(
                    "--ratio",
                    (img.naturalWidth / img.naturalHeight).toFixed(4),
                );
            }
        };
        if (img.complete) apply();
        else img.addEventListener("load", apply, { once: true });
    });
}
function fitCardHeights(grid) {
    if (grid.classList.contains("photo-grid")) return;
    let tallest = MIN_CARD_H;
    grid.querySelectorAll(".item-card-body").forEach((body) => {
        body.style.alignSelf = "flex-start";
        tallest = Math.max(tallest, body.offsetHeight);
        body.style.alignSelf = "";
    });
    grid.style.setProperty("--card-h", `${Math.ceil(tallest) + 2}px`);
}
function autoFitCards(grid) {
    if (grid.classList.contains("photo-grid")) return () => {};
    fitCardHeights(grid);
    document.fonts?.ready.then(() => fitCardHeights(grid));
    let lastWidth = grid.clientWidth;
    const observer = new ResizeObserver(() => {
        if (grid.clientWidth === lastWidth) return;
        lastWidth = grid.clientWidth;
        fitCardHeights(grid);
    });
    observer.observe(grid);
    return () => observer.disconnect();
}
function loadSlide(slide) {
    const { src, srcset } = slide?.dataset ?? {};
    if (src && !slide.getAttribute("src")) {
        if (srcset) slide.srcset = srcset;
        slide.src = src;
    }
}
function initCarousel(card, delay) {
    const slides = [...card.querySelectorAll(".item-card-slide")];
    const dots = [...card.querySelectorAll(".item-card-dot")];
    const total = slides.length;
    let current = 0;
    let paused = false;
    let visible = true;
    let starter = null;
    let interval = null;
    const show = (index) => {
        current = (index + total) % total;
        loadSlide(slides[current]);
        loadSlide(slides[(current + 1) % total]);
        slides.forEach((slide, i) => {
            slide.dataset.pos = slideState(
                (i - current + total) % total,
                total,
            );
        });
        dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
    };
    const stop = () => clearInterval(interval);
    const start = () => {
        stop();
        interval = setInterval(() => {
            if (!paused && visible) show(current + 1);
        }, CAROUSEL_INTERVAL);
    };
    dots.forEach((dot, i) =>
        dot.addEventListener("click", () => {
            show(i);
            if (starter !== null) start();
        }),
    );
    card.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "mouse") paused = true;
    });
    card.addEventListener("pointerleave", () => (paused = false));
    const observer = new IntersectionObserver(
        ([entry]) => (visible = entry.isIntersecting),
        { threshold: 0.1 },
    );
    observer.observe(card);
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reduceMotion) {
        starter = setTimeout(() => {
            loadSlide(slides[1]);
            start();
        }, delay);
    }
    return () => {
        clearTimeout(starter);
        stop();
        observer.disconnect();
    };
}
function stopCarousels() {
    carouselCleanups.forEach((cleanup) => cleanup());
    carouselCleanups = [];
}
function startCarousels(grid) {
    grid.querySelectorAll(".item-card.has-carousel").forEach((card, i) => {
        carouselCleanups.push(initCarousel(card, 1800 + i * 700));
    });
}
export function openModal(key, origin) {
    const sec = sections[key];
    if (!sec) return;
    stopCarousels();
    activeKey = key;
    const backdrop = document.getElementById("modal");
    const panel = backdrop.querySelector(".modal-panel");
    if (!isModalOpen()) {
        panel.style.setProperty("--origin-x", origin ? `${origin.x}px` : "50%");
        panel.style.setProperty("--origin-y", origin ? `${origin.y}px` : "50%");
    }
    renderTitle(document.getElementById("modal-title"), sec.title);
    document.getElementById("modal-subtitle").textContent = sec.subtitle;
    const grid = document.getElementById("modal-content");
    grid.classList.toggle("photo-grid", Boolean(sec.justified));
    grid.classList.toggle("project-grid", sec.variant === "project");
    grid.style.removeProperty("--card-h");
    grid.innerHTML = sec.items
        .map((item, i) => renderCard(sec, item, i))
        .join("");
    if (sec.justified) applyImageRatios(grid);
    startCarousels(grid);
    carouselCleanups.push(autoFitCards(grid));
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.section === key);
    });
    backdrop.classList.add("open");
    panel.focus({ preventScroll: true });
}
export function closeModal() {
    stopCarousels();
    activeKey = null;
    document.getElementById("modal").classList.remove("open");
    document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
}
export function toggleModal(key, origin) {
    if (isModalOpen() && activeKey === key) {
        closeModal();
    } else {
        openModal(key, origin);
    }
}
export function moveSection(delta) {
    const keys = Object.keys(sections);
    const next = keys.indexOf(activeKey) + delta;
    if (next >= 0 && next < keys.length) openModal(keys[next]);
}
export function initModal() {
    document.addEventListener("click", (e) => {
        const toggle = e.target.closest("[data-modal-toggle]");
        if (toggle) {
            const r = toggle.getBoundingClientRect();
            toggleModal(toggle.dataset.modalToggle, {
                x: r.left + r.width / 2,
                y: r.top + r.height / 2,
            });
            return;
        }
        if (e.target.closest("[data-modal-close]")) closeModal();
    });
}
