/**
 * Berganti antara tiga gambar latar secara berurutan (crossfade diatur CSS):
 *   1. fotomount.png  → tidak ada kelas
 *   2. fotomount2.png → kelas .is-alt
 *   3. fotomount3.png → kelas .is-alt2
 * Setiap tekan B maju satu langkah, kemudian kembali ke awal.
 */
let _bgIndex = 0;

export function toggleBackground() {
    const scene = document.getElementById("bg-scene");
    _bgIndex = (_bgIndex + 1) % 3;
    scene.classList.toggle("is-alt",  _bgIndex === 1);
    scene.classList.toggle("is-alt2", _bgIndex === 2);
}

/** Efek parallax: latar bergeser halus mengikuti kursor. */
function initParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scene = document.getElementById("bg-scene");
    const MAX_SHIFT = 24; // pergeseran maksimum (px); jaga di bawah ±4% lebar layar
    const SMOOTHING = 0.06; // 0.01 = sangat lambat, 0.2 = hampir instan
    const SCALE = 1.08; // harus sama dengan nilai scale di CSS

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

/**
 * Menghubungkan tombol [data-toggle-background] (brand di sidebar)
 * dan mengaktifkan parallax.
 */
export function initBackground() {
    document.addEventListener("click", (e) => {
        if (e.target.closest("[data-toggle-background]")) toggleBackground();
    });
    initParallax();
}
