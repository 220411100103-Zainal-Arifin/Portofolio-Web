import { sections } from "./data.js";

/**
 * Kunci seksi yang sedang tampil pada modal (null jika modal tertutup).
 * @type {string|null}
 */
let activeKey = null;

/** @returns {boolean} true jika modal sedang terbuka. */
export const isModalOpen = () =>
    document.getElementById("modal").classList.contains("open");

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
 * Membuka modal dan mengisinya dengan konten seksi yang dipilih.
 * @param {string} key - Kunci seksi pada objek `sections`.
 * @param {{x:number, y:number}} [origin] - Titik asal animasi (piksel viewport).
 */
export function openModal(key, origin) {
    const sec = sections[key];
    if (!sec) return;

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

    document.getElementById("modal-content").innerHTML = sec.items
        .map(
            (item) => `
    <article class="item-card${item.image ? " has-image" : ""}">
        ${
            item.image
                ? `<img class="item-card-img" src="${item.image}"
                        alt="${item.alt ?? item.title}" loading="lazy">`
                : ""
        }
        <div class="item-card-body">
            <div class="item-card-tag">${item.tag}</div>
            <div class="item-card-title">${item.title}</div>
            <div class="item-card-desc">${item.desc}</div>
        </div>
    </article>
`,
        )
        .join("");

    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.section === key);
    });

    backdrop.classList.add("open");
    panel.focus({ preventScroll: true });
}

/** Menutup modal dan mereset status seksi aktif. */
export function closeModal() {
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
