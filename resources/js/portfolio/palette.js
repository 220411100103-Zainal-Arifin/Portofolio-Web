import { BACKGROUNDS } from "./background.js";
const SWATCHES = 8;
const SAMPLE_W = 64;
const FALLBACK = [
    "#ece8e0",
    "#d3cec4",
    "#b9b4aa",
    "#9b9a95",
    "#7d7c78",
    "#5b5a57",
    "#3a3938",
    "#1f1f1e",
];
const luma = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const toHex = (rgb) =>
    "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const mean = (bucket) =>
    bucket
        .reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0])
        .map((v) => v / bucket.length);
function pixelsOf(img) {
    const w = SAMPLE_W;
    const h = Math.max(
        1,
        Math.round((img.naturalHeight / img.naturalWidth) * w),
    );
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d", { willReadFrequently: true });
    g.drawImage(img, 0, 0, w, h);
    const { data } = g.getImageData(0, 0, w, h);
    const out = [];
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 128) out.push([data[i], data[i + 1], data[i + 2]]);
    }
    return out;
}
function widest(bucket) {
    const lo = [255, 255, 255],
        hi = [0, 0, 0];
    for (const p of bucket) {
        for (let i = 0; i < 3; i++) {
            if (p[i] < lo[i]) lo[i] = p[i];
            if (p[i] > hi[i]) hi[i] = p[i];
        }
    }
    const range = hi.map((v, i) => v - lo[i]);
    const ch = range.indexOf(Math.max(...range));
    return { ch, size: range[ch] };
}
function quantize(px, n) {
    const buckets = [px];
    while (buckets.length < n) {
        let at = -1,
            best = 0,
            ch = 0;
        buckets.forEach((b, i) => {
            if (b.length < 2) return;
            const w = widest(b);
            const score = w.size * b.length;
            if (score > best) {
                best = score;
                at = i;
                ch = w.ch;
            }
        });
        if (at < 0) break;
        const [b] = buckets.splice(at, 1);
        b.sort((x, y) => x[ch] - y[ch]);
        const mid = b.length >> 1;
        buckets.push(b.slice(0, mid), b.slice(mid));
    }
    return buckets.map(mean);
}
function extract(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            try {
                const px = pixelsOf(img);
                if (!px.length) return resolve(FALLBACK);
                const colors = quantize(px, SWATCHES)
                    .sort((a, b) => luma(b) - luma(a))
                    .map(toHex);
                resolve(colors);
            } catch (err) {
                console.warn("[palette] piksel gambar tidak bisa dibaca:", err);
                resolve(FALLBACK);
            }
        };
        img.onerror = () => {
            console.warn("[palette] gagal memuat", src);
            resolve(FALLBACK);
        };
        img.src = src;
    });
}
export function initPalette() {
    const box = document.querySelector("[data-palette]");
    const swatchBox = box?.querySelector("[data-palette-swatches]");
    if (!swatchBox) return;
    const counter = box.querySelector("[data-bg-counter]");
    const swatches = Array.from({ length: SWATCHES }, () => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "palette-swatch";
        b.dataset.paletteSwatch = "";
        return b;
    });
    swatchBox.replaceChildren(...swatches);
    const palettes = new Map();
    let current = 0;
    const paint = (colors) =>
        swatches.forEach((b, i) => {
            const c = colors[i]?.toUpperCase();
            b.hidden = !c;
            if (!c) return;
            b.style.backgroundColor = c;
            b.dataset.hex = c;
            b.dataset.tip = c;
            b.setAttribute("aria-label", `Salin warna ${c}`);
        });
    swatchBox.addEventListener("click", async (e) => {
        const s = e.target.closest("[data-palette-swatch]");
        if (!s?.dataset.hex) return;
        let tip = "tersalin ✓";
        try {
            await navigator.clipboard.writeText(s.dataset.hex);
        } catch {
            tip = s.dataset.hex;
        }
        s.dataset.tip = tip;
        s.classList.add("is-tip");
        clearTimeout(s._tipTimer);
        s._tipTimer = setTimeout(() => {
            s.classList.remove("is-tip");
            s.dataset.tip = s.dataset.hex;
        }, 1400);
        if (e.detail > 0) s.blur();
    });
    const show = (index) => {
        current = index;
        if (counter) counter.textContent = `${index + 1}/${BACKGROUNDS.length}`;
        if (palettes.has(index)) paint(palettes.get(index));
    };
    document.addEventListener("background:change", (e) => show(e.detail.index));
    BACKGROUNDS.forEach((src, i) =>
        extract(src).then((colors) => {
            palettes.set(i, colors);
            if (i === current) paint(colors);
        }),
    );
    show(0);
}
