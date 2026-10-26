import { sections } from "./data.js";

/**
 * Kunci seksi yang sedang tampil pada modal (null jika modal tertutup).
 * @type {string|null}
 */
let activeKey = null;

/** Fungsi pembersih untuk setiap carousel yang sedang berjalan. */
let carouselCleanups = [];

/** Jeda antar pergantian foto (ms). */
const CAROUSEL_INTERVAL = 4200;

/** Tinggi minimum kartu (px); sama dengan nilai cadangan --card-h di modal.css. */
const MIN_CARD_H = 260;

/** Folder thumbnail hasil scripts/make-thumbs.mjs. */
const THUMB_DIR = "/images/portfolio/thumbs/";

/** @returns {boolean} true jika modal sedang terbuka. */
export const isModalOpen = () =>
    document.getElementById("modal").classList.contains("open");

/**
 * Mengamankan teks dari data.js sebelum dimasukkan ke innerHTML, supaya tanda kutip
 * atau tanda < > di dalam `alt`, judul, dan deskripsi tidak merusak markup kartu.
 * @param {unknown} value
 * @returns {string}
 */
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

/** Lebar varian yang dibuat scripts/make-thumbs.mjs (harus sama). */
const THUMB_WIDTHS = [640, 1280, 1920];

/** Lebar varian yang dipakai sebagai `src` cadangan bagi peramban tanpa srcset. */
const DEFAULT_WIDTH = 1280;

/**
 * Path varian WebP dari gambar asli. Subfolder di bawah images/portfolio dipertahankan.
 *   ("/images/portfolio/foo.jpg", 640)           → "/images/portfolio/thumbs/foo-640.webp"
 *   ("/images/portfolio/fotografi/a.jpg", 640)   → "/images/portfolio/thumbs/fotografi/a-640.webp"
 * @param {string} src
 * @param {number} width
 * @returns {string}
 */
const thumbPath = (src, width) => {
    const rel = String(src)
        .replace(/^\/?images\/portfolio\//, "")
        .replace(/\.[^.]+$/, "");
    return `${THUMB_DIR}${rel}-${width}.webp`;
};

/**
 * Atribut sumber gambar. Peramban memilih varian terkecil yang masih cukup tajam
 * untuk ukuran tampil dan kerapatan piksel layarnya (sizes + srcset), sehingga
 * kualitas tidak berkurang tetapi data yang diunduh jauh lebih kecil.
 * URL eksternal dipakai apa adanya.
 * @param {string} src      - Path gambar asli.
 * @param {string} sizes    - Nilai atribut sizes.
 * @param {boolean} [deferred=false] - true → pakai data-src (dimuat belakangan oleh loadSlide).
 * @returns {string}
 */
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

/**
 * Atribut onerror: jika thumbnail belum dibuat / tidak ditemukan,
 * kembali memakai gambar asli agar tampilan tidak rusak.
 * @param {string} src - Path gambar asli.
 * @returns {string}
 */
const fallback = (src) =>
    `onerror="this.onerror=null;this.removeAttribute('srcset');this.src='${esc(src)}'"`;

/**
 * Merender judul dengan huruf pertama tiap kata diperbesar.
 * @param {HTMLElement} el
 * @param {string} text
 */
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

/**
 * Menentukan posisi sebuah foto dalam tumpukan.
 *  front  → foto yang sedang tampil
 *  next   → foto berikutnya (menunggu di belakang, sisi kanan)
 *  back   → foto yang baru saja tampil (surut ke belakang, sisi kiri)
 *  hidden → foto lain yang belum giliran
 * @param {number} offset - Jarak foto dari foto aktif (0 = aktif).
 * @param {number} total  - Jumlah foto.
 * @returns {"front"|"next"|"back"|"hidden"}
 */
function slideState(offset, total) {
    if (offset === 0) return "front";
    if (offset === 1) return "next";
    if (offset === total - 1 && total > 2) return "back";
    return "hidden";
}

/**
 * Membuat HTML satu kartu.
 *  - Item boleh memakai `image` (satu foto) atau `images` (beberapa foto).
 *    Jika ada lebih dari satu foto, kartu menjadi carousel bertumpuk.
 *  - Gambar yang ditampilkan adalah thumbnail; gambar asli hanya dipakai sebagai cadangan.
 *  - Pada carousel, hanya foto pertama yang dimuat di awal. Foto lain dimuat
 *    sesaat sebelum gilirannya (lihat loadSlide).
 *  - Seksi bertanda `imageOnly` (Sertifikat, Fotografi): hanya gambar, tanpa teks.
 *    Item yang tidak punya gambar tetap dirender sebagai kartu teks supaya tidak
 *    menjadi kotak kosong.
 *  - Seksi lain (Proyek, Tentang Saya): gambar + teks di atas gambar.
 *  - Seksi bertanda `justified` (Fotografi): gambar tidak di-lazy-load agar rasio
 *    aslinya tersedia sebelum layout dihitung.
 * @param {object} sec  Seksi dari data.js
 * @param {object} item Item di dalam seksi
 * @param {number} [index=0] Urutan item (dipakai untuk nomor pada kartu proyek)
 * @returns {string}
 */
function renderCard(sec, item, index = 0) {
    const sources = item.images?.length
        ? item.images
        : item.image
          ? [item.image]
          : [];
    const hasImage = sources.length > 0;
    const multi = sources.length > 1;

    const imageOnly = Boolean(sec.imageOnly && hasImage);
    // Seksi variant "project": item tanpa gambar tampil sebagai kartu proyek.
    const projectCard = sec.variant === "project" && !hasImage;
    const alt = esc(item.alt ?? item.title ?? "");
    const lazy = sec.justified ? "" : ' loading="lazy"';
    // Perkiraan lebar tampil kartu: dipakai peramban untuk memilih varian srcset.
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

/**
 * Mengisi --ratio pada tiap kartu berdasarkan dimensi asli gambar.
 * Pada kartu carousel, foto pertama yang dipakai sebagai acuan.
 * @param {HTMLElement} grid
 */
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

/**
 * Menyamakan tinggi semua kartu pada grid biasa (bukan layout foto).
 * Tinggi asli teks tiap kartu diukur, lalu yang tertinggi (minimal MIN_CARD_H)
 * disimpan pada --card-h di elemen grid dan dipakai semua kartu (lihat modal.css).
 * @param {HTMLElement} grid
 */
function fitCardHeights(grid) {
    if (grid.classList.contains("photo-grid")) return;

    let tallest = MIN_CARD_H;
    grid.querySelectorAll(".item-card-body").forEach((body) => {
        body.style.alignSelf = "flex-start"; // lepas dari peregangan agar tinggi aslinya terukur
        tallest = Math.max(tallest, body.offsetHeight);
        body.style.alignSelf = "";
    });
    grid.style.setProperty("--card-h", `${Math.ceil(tallest) + 2}px`);
}

/**
 * Menjalankan fitCardHeights sekarang, setelah font selesai dimuat, dan setiap kali
 * lebar grid berubah (ukuran jendela, munculnya scrollbar), karena itu mengubah
 * jumlah baris teks.
 * @param {HTMLElement} grid
 * @returns {() => void} Fungsi pembersih.
 */
function autoFitCards(grid) {
    if (grid.classList.contains("photo-grid")) return () => {};

    fitCardHeights(grid);
    document.fonts?.ready.then(() => fitCardHeights(grid));

    let lastWidth = grid.clientWidth;
    const observer = new ResizeObserver(() => {
        if (grid.clientWidth === lastWidth) return; // abaikan perubahan tinggi akibat fitCardHeights
        lastWidth = grid.clientWidth;
        fitCardHeights(grid);
    });
    observer.observe(grid);

    return () => observer.disconnect();
}

/**
 * Memuat foto carousel yang ditunda (atribut data-src) jika belum dimuat.
 * @param {HTMLImageElement|undefined} slide
 */
function loadSlide(slide) {
    const { src, srcset } = slide?.dataset ?? {};
    if (src && !slide.getAttribute("src")) {
        if (srcset) slide.srcset = srcset; // srcset diisi lebih dulu agar varian yang tepat terpilih
        slide.src = src;
    }
}

/**
 * Menjalankan carousel pada satu kartu.
 *  - Berhenti sementara saat kursor mouse berada di atas kartu.
 *  - Berhenti saat kartu berada di luar layar (hemat CPU/GPU).
 *  - Tidak berjalan otomatis jika pengguna memilih "reduce motion".
 * @param {HTMLElement} card
 * @param {number} delay - Penundaan awal (ms) agar kartu tidak berganti serentak.
 * @returns {() => void} Fungsi untuk menghentikan carousel.
 */
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
            loadSlide(slides[1]); // siapkan foto berikutnya sebelum giliran pertama
            start();
        }, delay);
    }

    return () => {
        clearTimeout(starter);
        stop();
        observer.disconnect();
    };
}

/** Menghentikan semua carousel yang sedang berjalan. */
function stopCarousels() {
    carouselCleanups.forEach((cleanup) => cleanup());
    carouselCleanups = [];
}

/**
 * Menyalakan carousel pada semua kartu yang memiliki lebih dari satu foto.
 * @param {HTMLElement} grid
 */
function startCarousels(grid) {
    grid.querySelectorAll(".item-card.has-carousel").forEach((card, i) => {
        carouselCleanups.push(initCarousel(card, 1800 + i * 700));
    });
}

/**
 * Membuka modal dan mengisinya dengan konten seksi yang dipilih.
 * @param {string} key - Kunci seksi pada objek `sections`.
 * @param {{x:number, y:number}} [origin] - Titik asal animasi (piksel viewport).
 */
export function openModal(key, origin) {
    const sec = sections[key];
    if (!sec) return;

    stopCarousels();
    activeKey = key;

    const backdrop = document.getElementById("modal");
    const panel = backdrop.querySelector(".modal-panel");

    // Titik asal hanya diatur saat modal baru dibuka
    if (!isModalOpen()) {
        panel.style.setProperty("--origin-x", origin ? `${origin.x}px` : "50%");
        panel.style.setProperty("--origin-y", origin ? `${origin.y}px` : "50%");
    }

    renderTitle(document.getElementById("modal-title"), sec.title);
    document.getElementById("modal-subtitle").textContent = sec.subtitle;

    const grid = document.getElementById("modal-content");
    grid.classList.toggle("photo-grid", Boolean(sec.justified));
    grid.classList.toggle("project-grid", sec.variant === "project");
    grid.style.removeProperty("--card-h"); // buang tinggi dari seksi sebelumnya
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

/** Menutup modal dan mereset status seksi aktif. */
export function closeModal() {
    stopCarousels();
    activeKey = null;
    document.getElementById("modal").classList.remove("open");
    document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
}

/**
 * Membuka seksi jika belum aktif, atau menutup modal jika seksi
 * yang sama sedang tampil (perilaku toggle).
 * @param {string} key
 * @param {{x:number, y:number}} [origin]
 */
export function toggleModal(key, origin) {
    if (isModalOpen() && activeKey === key) {
        closeModal();
    } else {
        openModal(key, origin);
    }
}

/**
 * Pindah ke seksi sebelum/sesudahnya (dipakai panah atas/bawah).
 * @param {number} delta - +1 untuk berikutnya, -1 untuk sebelumnya.
 */
export function moveSection(delta) {
    const keys = Object.keys(sections);
    const next = keys.indexOf(activeKey) + delta;
    if (next >= 0 && next < keys.length) openModal(keys[next]);
}

/**
 * Menghubungkan tombol di HTML lewat atribut data-*:
 *   data-modal-toggle="projects" → toggle seksi tersebut
 *   data-modal-close             → tutup modal
 */
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
