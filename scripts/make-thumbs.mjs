/**
 * Membuat beberapa ukuran gambar WebP berkualitas tinggi untuk semua gambar di
 * public/images/portfolio, termasuk subfolder (mis. fotografi/).
 * Hasil disimpan di public/images/portfolio/thumbs/ dengan struktur subfolder yang
 * sama dan pola <nama>-<lebar>.webp, contohnya:
 *   portfolio/foto.jpg            → thumbs/foto-640.webp, foto-1280.webp, foto-1920.webp
 *   portfolio/fotografi/arjuno.jpg → thumbs/fotografi/arjuno-640.webp, ...
 * File asli tidak diubah. modal.js memakai atribut srcset sehingga setiap
 * perangkat hanya mengunduh ukuran yang benar-benar dibutuhkannya.
 *
 * Pemakaian (dari root proyek):
 *   npm install -D sharp
 *   node scripts/make-thumbs.mjs
 *
 * Jalankan ulang setiap kali menambah atau mengganti gambar.
 */
import sharp from "sharp";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const SRC_DIR = "public/images/portfolio";
const OUT_DIR = path.join(SRC_DIR, "thumbs");
const WIDTHS = [640, 1280, 1920]; // harus sama dengan THUMB_WIDTHS di modal.js
const QUALITY = 90; // 90 hampir tidak dapat dibedakan dari aslinya; naikkan ke 95 jika perlu

// Folder ini sepenuhnya dibuat oleh skrip, jadi aman dibersihkan agar tidak ada sisa lama.
await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

// Baca seluruh subfolder, tetapi lewati folder thumbs itu sendiri.
const entries = await readdir(SRC_DIR, { recursive: true });
const files = entries.filter(
    (f) => !/^thumbs([\\/]|$)/.test(f) && /\.(jpe?g|png)$/i.test(f),
);

let before = 0;
let after = 0;

for (const file of files) {
    const input = path.join(SRC_DIR, file);
    const base = file.replace(/\.[^.]+$/, ""); // termasuk subfolder, mis. "fotografi/arjuno"
    const original = (await stat(input)).size;
    before += original;

    await mkdir(path.dirname(path.join(OUT_DIR, base)), { recursive: true });

    const sizes = [];
    for (const width of WIDTHS) {
        const info = await sharp(input)
            .rotate() // terapkan orientasi EXIF agar foto tidak miring
            .resize({ width, withoutEnlargement: true })
            .webp({ quality: QUALITY, smartSubsample: true })
            .toFile(path.join(OUT_DIR, `${base}-${width}.webp`));
        sizes.push(`${width}px ${(info.size / 1024).toFixed(0)} KB`);
        after += info.size;
    }

    console.log(
        `${file} (${(original / 1024).toFixed(0)} KB) → ${sizes.join(", ")}`,
    );
}

console.log(
    `\n${files.length} gambar. Asli: ${(before / 1048576).toFixed(1)} MB; seluruh varian: ${(after / 1048576).toFixed(1)} MB (yang diunduh pengunjung hanya satu varian per gambar).`,
);
