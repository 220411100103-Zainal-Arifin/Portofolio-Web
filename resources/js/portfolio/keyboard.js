import { toggleModal, closeModal, isModalOpen, moveSection } from "./modal.js";
import { toggleBackground } from "./background.js";
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
