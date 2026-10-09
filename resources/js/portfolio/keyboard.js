import { toggleModal, closeModal, isModalOpen, moveSection } from "./modal.js";
import { toggleBackground } from "./background.js";

/**
 * Pintasan keyboard
 * ─────────────────────────────────────────────────────────────
 * Tombol      Aksi
 * ─────────────────────────────────────────────────────────────
 * P           Toggle modal Projects
 * C           Toggle modal Certificates
 * F           Toggle modal Photography
 * A           Toggle modal About
 * B           Ganti gambar latar (juga lewat klik pada "Finn — Portfolio")
 * Esc         Menutup modal
 * ↓ (Down)    Pindah ke seksi berikutnya (hanya saat modal terbuka)
 * ↑ (Up)      Pindah ke seksi sebelumnya (hanya saat modal terbuka)
 * ─────────────────────────────────────────────────────────────
 * Toggle: menekan tombol huruf yang sama dua kali berturut-turut
 * menutup modal; menekan huruf seksi lain mengganti isi modal.
 *
 * Pengecualian (event diabaikan):
 *  - Fokus berada pada input, textarea, select, atau elemen contenteditable.
 *  - Ctrl, Meta (Cmd), atau Alt sedang ditekan, agar pintasan browser
 *    seperti Ctrl+C dan Ctrl+F tidak memicu modal.
 *  - Tombol ditahan (e.repeat), agar modal tidak berkedip.
 */
const SHORTCUTS = { p: "projects", c: "cert", f: "photo", a: "about" };

export function initKeyboard() {
    document.addEventListener("keydown", (e) => {
        const t = e.target;
        if (
            ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) ||
            t.isContentEditable
        )
            return;
        if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;

        const key = e.key.toLowerCase();

        if (key === "escape") {
            closeModal();
            return;
        }

        if (key === "b") {
            toggleBackground();
            return;
        }

        if (SHORTCUTS[key]) {
            toggleModal(SHORTCUTS[key]);
            return;
        }

        if (isModalOpen() && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            moveSection(e.key === "ArrowDown" ? 1 : -1);
        }
    });
}
