import bg1 from "../../images/fotomount.png";
import bg2 from "../../images/fotomount2.png";
import bg3 from "../../images/fotomount3.png";
export const BACKGROUNDS = [bg1, bg2, bg3];
let _bgIndex = 0;
export function toggleBackground() {
    const scene = document.getElementById("bg-scene");
    _bgIndex = (_bgIndex + 1) % BACKGROUNDS.length;
    scene.classList.toggle("is-alt", _bgIndex === 1);
    scene.classList.toggle("is-alt2", _bgIndex === 2);
    document.dispatchEvent(
        new CustomEvent("background:change", { detail: { index: _bgIndex } }),
    );
}
function initParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scene = document.getElementById("bg-scene");
    const MAX_SHIFT = 24;
    const SMOOTHING = 0.06;
    const SCALE = 1.08;
    let targetX = 0,
        targetY = 0,
        currentX = 0,
        currentY = 0;
    document.addEventListener("mousemove", (e) => {
        targetX = -(e.clientX / window.innerWidth - 0.5) * 2 * MAX_SHIFT;
        targetY = -(e.clientY / window.innerHeight - 0.5) * 2 * MAX_SHIFT;
    });
    function frame() {
        currentX += (targetX - currentX) * SMOOTHING;
        currentY += (targetY - currentY) * SMOOTHING;
        scene.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) scale(${SCALE})`;
        requestAnimationFrame(frame);
    }
    frame();
}
export function initBackground() {
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-toggle-background]");
        if (!btn) return;
        toggleBackground();
        if (e.detail > 0) btn.blur();
    });
    initParallax();
}
