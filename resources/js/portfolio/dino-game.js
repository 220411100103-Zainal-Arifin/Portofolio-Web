(() => {
    "use strict";

    const canvas = document.querySelector("canvas[data-dino-game]");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;

    const BASE = (canvas.dataset.assets || "/assets/dino").replace(/\/$/, "");
    const SCOPE = canvas.dataset.spaceScope || "visible"; // visible | focus
    const SHOW_TEXT = canvas.dataset.text === "on"; // skor, HI, petunjuk, GAME OVER (default: mati)
    const muteBtn = document.querySelector("[data-dino-mute]");

    /* ---------- warna teks/garis tanah/ikon ulang (aset kucing sudah berwarna sendiri) ---------- */
    const cs = getComputedStyle(canvas);
    const cssVar = (name, fallback) =>
        cs.getPropertyValue(name).trim() || fallback;
    const C_TEXT = cssVar("--game-ink", "#2e2e2e");
    const C_MUTED = cssVar("--game-ink-muted", "rgba(46,46,46,.5)");
    const C_AMBER = cssVar("--game-accent", "#a8620d");
    const MONO = 'ui-monospace, Menlo, Consolas, "Courier New", monospace';

    /* ---------- ukuran tampil tiap jenis sprite ----------
       Aset sumber berukuran ratusan piksel (foto/pixel-art beresolusi tinggi);
       nilai di bawah adalah TINGGI tampilnya di dunia game (lebar menyesuaikan
       proporsional). Ubah angkanya untuk membesarkan/mengecilkan kategori tertentu. */
    const SIZE = {
        cat: 52, // kucing berlari & melompat — jadi ACUAN skala untuk semua pose kucing lain
        // (merunduk, rebah mati). Lihat CAT_SCALE di bagian pemuatan aset: skala yang sama
        // dipakai ke semua pose supaya "besar tubuh" kucingnya konsisten, bukan tiap pose
        // dipaksa ke tinggi tampil sendiri-sendiri (itu sebabnya dulu kucing "mati" kelihatan
        // lebih kecil dari kucing "lari" — kotak pose rebah memang jauh lebih pendek karena
        // badannya horizontal, bukan karena kucingnya benar-benar mengecil).
        bird: 30,
        bush: 34,
        cloud: 16,
    };

    /** Kotak piksel yang benar-benar terlihat (alpha di atas ambang) pada satu gambar sumber.
        Dipakai untuk memangkas padding transparan yang ikut terbawa dari file PNG mentah,
        supaya sprite yang tampil (dan hitbox-nya) pas dengan gambar yang benar-benar kelihatan. */
    function alphaBBox(img, threshold = 16) {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const g = c.getContext("2d");
        g.drawImage(img, 0, 0);
        let data;
        try {
            data = g.getImageData(0, 0, c.width, c.height).data;
        } catch (e) {
            // Kanvas "tainted" (aset lintas-origin tanpa CORS) — tak bisa dibaca pikselnya,
            // jadi pakai ukuran penuh gambar apa adanya (tanpa pemangkasan).
            return { x: 0, y: 0, w: img.width, h: img.height };
        }
        let minX = c.width,
            minY = c.height,
            maxX = -1,
            maxY = -1;
        for (let y = 0; y < c.height; y++) {
            for (let x = 0; x < c.width; x++) {
                if (data[(y * c.width + x) * 4 + 3] > threshold) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        if (maxX < minX || maxY < minY)
            return { x: 0, y: 0, w: img.width, h: img.height };
        return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
    }

    /** Menggabungkan bbox beberapa frame SEJENIS (mis. semua frame lari) jadi satu kotak
        yang sama untuk semuanya. Wajib dipakai untuk sprite yang dianimasikan (gonta-ganti
        frame): kalau tiap frame dipangkas sendiri-sendiri dengan bbox masing-masing, posisi
        piksel pertama yang tak-transparan bisa beda tiap frame → kucing/burung kelihatan
        "bergetar" horizontal/vertikal saat animasi berjalan. Dengan union bbox, kotak potongnya
        sama untuk seluruh kelompok, jadi cuma padding yang memang tak terpakai di SEMUA frame
        yang dibuang. */
    function unionBBox(imgs, threshold = 16) {
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        imgs.forEach((img) => {
            const b = alphaBBox(img, threshold);
            minX = Math.min(minX, b.x);
            minY = Math.min(minY, b.y);
            maxX = Math.max(maxX, b.x + b.w);
            maxY = Math.max(maxY, b.y + b.h);
        });
        return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }

    /** Menskalakan gambar sumber ke tinggi target, lebar menyesuaikan proporsi asli.
        `rect` opsional: kalau diisi (biasanya hasil alphaBBox/unionBBox), hanya area itu dari
        gambar sumber yang diambil — dipakai untuk memangkas padding transparan sebelum scale.
        `flip` opsional: balik horizontal (dipakai untuk membalik arah hadap burung). */
    function scaledSprite(img, targetH, rect, flip) {
        const r = rect || { x: 0, y: 0, w: img.width, h: img.height };
        const scale = targetH / r.h;
        const w = Math.max(1, Math.round(r.w * scale));
        const h = Math.round(targetH);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const g = c.getContext("2d");
        g.imageSmoothingEnabled = true;
        g.imageSmoothingQuality = "high";
        if (flip) {
            g.save();
            g.translate(w, 0);
            g.scale(-1, 1);
        }
        g.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, w, h);
        if (flip) g.restore();
        return attachMask(c);
    }

    /** Menempelkan "topeng" alpha (piksel mana yang benar-benar tampak, bukan transparan) ke
        sebuah kanvas sprite, dipakai untuk tabrakan piksel-per-piksel di pixelOverlap().
        Kotak (AABB) tetap dipakai sebagai tes cepat awal; begitu dua kotak beririsan, baru
        dicek betul-betul apakah ada piksel non-transparan dari kedua sprite yang bertumpuk.
        Ini yang membereskan "ruang kosong di gambar" akibat pose diagonal/berlekuk (kucing
        lari, semak) — bukan lagi ditambal dengan menambah/mengurangi ukuran kotak. */
    function attachMask(canvas, threshold = 16) {
        const g = canvas.getContext("2d");
        try {
            const { data } = g.getImageData(0, 0, canvas.width, canvas.height);
            const mask = new Uint8Array(canvas.width * canvas.height);
            for (let i = 0; i < mask.length; i++)
                mask[i] = data[i * 4 + 3] > threshold ? 1 : 0;
            canvas.alphaMask = mask;
        } catch (e) {
            // Kanvas "tainted" (aset lintas-origin tanpa CORS) — tak bisa dibaca pikselnya.
            // Ditandai null; pixelOverlap() akan mundur otomatis ke deteksi kotak biasa.
            canvas.alphaMask = null;
        }
        return canvas;
    }

    /** Tabrakan piksel-per-piksel antara dua sprite pada posisi dunia masing-masing.
        boxA/boxB: {x,y,w,h} di koordinat dunia game. spriteA/spriteB: kanvas sumbernya
        (harus berukuran sama dengan w/h box-nya) yang sudah punya .alphaMask dari attachMask(). */
    function pixelOverlap(boxA, spriteA, boxB, spriteB) {
        const x0 = Math.max(boxA.x, boxB.x);
        const y0 = Math.max(boxA.y, boxB.y);
        const x1 = Math.min(boxA.x + boxA.w, boxB.x + boxB.w);
        const y1 = Math.min(boxA.y + boxA.h, boxB.y + boxB.h);
        if (x1 <= x0 || y1 <= y0) return false; // kotaknya sendiri sudah tidak beririsan

        if (!spriteA.alphaMask || !spriteB.alphaMask) return true; // tak bisa dicek -> anggap kena (aman)

        const ax = Math.round(boxA.x),
            ay = Math.round(boxA.y);
        const bx = Math.round(boxB.x),
            by = Math.round(boxB.y);
        const ix0 = Math.floor(x0),
            iy0 = Math.floor(y0),
            ix1 = Math.ceil(x1),
            iy1 = Math.ceil(y1);
        for (let y = iy0; y < iy1; y++) {
            const ayA = y - ay,
                ayB = y - by;
            if (
                ayA < 0 ||
                ayA >= spriteA.height ||
                ayB < 0 ||
                ayB >= spriteB.height
            )
                continue;
            const rowA = ayA * spriteA.width,
                rowB = ayB * spriteB.width;
            for (let x = ix0; x < ix1; x++) {
                const axA = x - ax,
                    axB = x - bx;
                if (
                    axA < 0 ||
                    axA >= spriteA.width ||
                    axB < 0 ||
                    axB >= spriteB.width
                )
                    continue;
                if (
                    spriteA.alphaMask[rowA + axA] &&
                    spriteB.alphaMask[rowB + axB]
                )
                    return true;
            }
        }
        return false;
    }

    /** Membalik sprite secara horizontal (cermin kiri-kanan) dan menghitung ulang topeng
        alpha-nya untuk sprite hasil baliknya. Dipakai untuk burung: rintangan bergerak dari
        kanan ke kiri (lihat update()), jadi moncongnya harus mengarah ke kiri agar sesuai
        arah terbangnya, bukan ke arah aset aslinya. */
    function flipHorizontal(canvas) {
        const c = document.createElement("canvas");
        c.width = canvas.width;
        c.height = canvas.height;
        const g = c.getContext("2d");
        g.save();
        g.translate(c.width, 0);
        g.scale(-1, 1);
        g.drawImage(canvas, 0, 0);
        g.restore();
        return attachMask(c);
    }

    const W = canvas.width,
        H = canvas.height,
        GROUND = H - 26;
    const GRAVITY = 2200,
        JUMP_V = -700;

    function combine(list, gap = 6) {
        const w =
            list.reduce((a, c) => a + c.width, 0) + gap * (list.length - 1);
        const h = Math.max(...list.map((c) => c.height));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const g = c.getContext("2d");
        let x = 0;
        list.forEach((s) => {
            g.drawImage(s, x, h - s.height);
            x += s.width + gap;
        });
        return attachMask(c);
    }

    /* ---------- muat aset ----------
       Kucing berlari: cat_run_01..05 (siklus lari) + cat_run_06/07 (pose melompat: naik & turun)
       Burung: bird_fly_01..05 (siklus kepakan)
       Semak: bush_01..05 (rintangan; 1 file = 1 varian ukuran/bentuk)
       Awan: cloud_01 */
    const FILES = {
        run1: "cat_run_01",
        run2: "cat_run_02",
        run3: "cat_run_03",
        run4: "cat_run_04",
        run5: "cat_run_05",
        jumpUp: "cat_run_06",
        jumpDown: "cat_run_07",
        crouch1: "cat_walk_crouch_01",
        crouch2: "cat_walk_crouch_02",
        crouch3: "cat_walk_crouch_03",
        crouch4: "cat_walk_crouch_04",
        dead1: "cat_lying_dead_01",
        dead2: "cat_lying_dead_02",
        dead3: "cat_lying_dead_03",
        dead4: "cat_lying_dead_04",
        bird1: "bird_fly_01",
        bird2: "bird_fly_02",
        bird3: "bird_fly_03",
        bird4: "bird_fly_04",
        bird5: "bird_fly_05",
        bush1: "bush_01",
        bush2: "bush_02",
        bush3: "bush_03",
        bush4: "bush_04",
        bush5: "bush_05",
        cloud: "cloud_01",
    };
    const load = (src) =>
        new Promise((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = () => rej(new Error("Gagal memuat " + src));
            i.src = src;
        });
    let IMG, BUSHES;

    /* ---------- suara (Web Audio, tanpa file audio) ---------- */
    // Default MATI karena hero tidak punya tombol suara. Aktifkan: data-sound="on" pada <canvas>.
    let actx = null,
        muted = canvas.dataset.sound !== "on";
    function sfx(kind) {
        if (muted) return;
        try {
            actx =
                actx ||
                new (window.AudioContext || window.webkitAudioContext)();
            if (actx.state === "suspended") actx.resume();
            const t = actx.currentTime;
            const tone = (f0, f1, d, type = "square", v = 0.05, delay = 0) => {
                const o = actx.createOscillator(),
                    g = actx.createGain();
                o.type = type;
                o.frequency.setValueAtTime(f0, t + delay);
                if (f1 !== f0)
                    o.frequency.exponentialRampToValueAtTime(f1, t + delay + d);
                g.gain.setValueAtTime(v, t + delay);
                g.gain.exponentialRampToValueAtTime(0.0001, t + delay + d);
                o.connect(g).connect(actx.destination);
                o.start(t + delay);
                o.stop(t + delay + d);
            };
            if (kind === "jump") tone(420, 820, 0.12);
            if (kind === "point") {
                tone(880, 880, 0.08);
                tone(1320, 1320, 0.12, "square", 0.05, 0.09);
            }
            if (kind === "die") tone(300, 70, 0.4, "sawtooth", 0.07);
        } catch (e) {}
    }

    /* ---------- suara aset (file .wav): kucing & burung ----------
       Path bisa dioverride lewat data-cat-sound / data-bird-sound pada <canvas>; kalau tidak
       diisi, defaultnya mengambil dari folder aset yang sama dengan sprite (BASE). Sediakan
       file .wav-nya di path tersebut — kalau filenya tak ada/gagal dimuat, pemutaran tidak
       menghentikan game, tapi DICATAT ke console (lihat onerror di bawah) supaya kelihatan
       jelas, bukan diam-diam seperti sebelumnya. Cek tab Console & Network di DevTools kalau
       suaranya tidak keluar.
       Default suara MATI kalau data-sound bukan "on" (lihat const `muted` di atas) — kalau
       kamu belum menaruh data-sound="on" di <canvas>, tekan M sekali dulu untuk menyalakannya
       (cek console: harus muncul log "[dino-game] suara: aktif"), baru lompat/​tunggu burung
       muncul untuk dengar bunyinya. Menekan M sendiri memang tidak berbunyi apa-apa — itu cuma
       menyalakan/mematikan, bukan pemicu suara. */
    const CAT_SOUND_SRC = canvas.dataset.catSound || `${BASE}/cat_meow.wav`;
    const BIRD_SOUND_SRC = canvas.dataset.birdSound || `${BASE}/bird_chirp.wav`;

    function loadClip(src, volume) {
        const el = new Audio(src);
        el.preload = "auto";
        el.volume = volume;
        el.addEventListener("error", () => {
            console.warn(
                `[dino-game] Gagal memuat file suara "${src}" — cek path-nya benar dan filenya ada di server.`,
            );
        });
        return el;
    }
    // Volume dasar tiap klip, dikalikan WAV_VOLUME_SCALE supaya gampang disetel semuanya
    // sekaligus dari satu angka ini (0.6 = 60% dari volume dasarnya).
    const WAV_VOLUME_SCALE = 0.5;
    const catClip = loadClip(CAT_SOUND_SRC, 0.55 * WAV_VOLUME_SCALE);
    const birdClip = loadClip(BIRD_SOUND_SRC, 0.35 * WAV_VOLUME_SCALE);

    /** Memutar klip .wav, ikut aturan mute yang sama dengan sfx() (tombol suara / tombol "M").
        Setiap pemutaran meng-clone elemennya supaya beberapa klip bisa tumpang tindih (mis. dua
        burung muncul berdekatan) tanpa saling memotong satu sama lain. */
    function playClip(el) {
        if (muted) return;
        try {
            const node = el.cloneNode(true);
            node.volume = el.volume;
            node.play().catch((err) => {
                // Paling sering: browser menolak karena belum ada interaksi pengguna sama
                // sekali di halaman, atau file suaranya memang gagal dimuat (lihat log error
                // di atas). Dicatat, bukan didiamkan, supaya gampang dilacak.
                console.warn(
                    "[dino-game] Gagal memutar suara:",
                    err.message || err,
                );
            });
        } catch (e) {}
    }

    function toggleMute() {
        muted = !muted;
        console.log("[dino-game] suara:", muted ? "mati" : "aktif");
        if (muteBtn)
            muteBtn.textContent = "suara: " + (muted ? "mati" : "aktif");
    }
    if (muteBtn)
        muteBtn.addEventListener("click", () => {
            toggleMute();
            canvas.focus({ preventScroll: true });
        });

    /* ---------- state ---------- */
    let hi = 0;
    try {
        hi = Number(localStorage.getItem("dinoBest")) || 0;
    } catch (e) {}

    let state = "idle"; // idle | running | over
    let cat, obstacles, clouds, dirt;
    let score = 0,
        speed = 300,
        animT = 0,
        sinceSpawn = 0,
        gap = 420;
    let flash = 0,
        lastMile = 0;
    let ducking = false,
        last = 0,
        diedAt = 0,
        clock = 0,
        deathT = 0,
        visible = true;

    const rand = (a, b) => a + Math.random() * (b - a);
    const px = (v) => Math.round(v);

    function reset() {
        cat = { x: 30, y: GROUND, vy: 0 };
        obstacles = [];
        score = 0;
        speed = 300;
        animT = 0;
        sinceSpawn = 0;
        gap = 420;
        lastMile = 0;
        flash = 0;
        deathT = 0;
    }
    function initScenery() {
        clouds = Array.from({ length: 4 }, (_, i) => ({
            x: i * 170 + rand(0, 80),
            y: rand(20, 80),
        }));
        dirt = Array.from({ length: 34 }, () => ({
            x: rand(0, W),
            y: rand(5, 16),
            w: Math.random() < 0.5 ? 2 : rand(4, 12),
        }));
    }

    /* ---------- input ---------- */
    function jump() {
        if (cat.y >= GROUND) {
            cat.vy = JUMP_V;
            sfx("jump");
            playClip(catClip);
        }
    }
    function press() {
        if (state === "over") {
            if (performance.now() - diedAt < 400) return; // cegah restart tak sengaja
            reset();
            state = "running";
            return;
        }
        if (state === "idle") {
            reset();
            state = "running";
            jump();
            return;
        }
        jump();
    }

    // Game berhenti dan tidak menerima tombol saat modal portofolio terbuka
    // (agar panah atas/bawah di modal tidak ikut membuat kucing melompat).
    const modalOpen = () =>
        document.getElementById("modal")?.classList.contains("open") ?? false;

    // Space hanya diambil alih saat game terlihat di layar dan fokus tidak berada
    // pada elemen interaktif, sehingga scroll halaman dan pengisian form tetap normal.
    const INTERACTIVE =
        'input,textarea,select,button,a,summary,[contenteditable],[role="button"]';
    function active() {
        if (modalOpen()) return false;
        if (SCOPE === "focus") return document.activeElement === canvas;
        if (!visible) return false;
        const a = document.activeElement;
        return !(
            a &&
            a !== document.body &&
            a !== canvas &&
            a.closest &&
            a.closest(INTERACTIVE)
        );
    }

    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            if (!active()) return;
            e.preventDefault();
            if (!e.repeat) press();
        } else if (e.code === "ArrowUp") {
            if (state === "idle" || !active()) return;
            e.preventDefault();
            if (!e.repeat) press();
        } else if (e.code === "ArrowDown") {
            if (state !== "running" || !active()) return;
            e.preventDefault();
            ducking = true;
        } else if (e.code === "KeyM" && !e.repeat) {
            if (active()) {
                toggleMute();
            } else {
                // Kalau M ditekan tapi tidak terjadi apa-apa (bahkan log "suara: aktif/mati"
                // di atas tidak muncul), inilah sebabnya: game menganggap dirinya tidak aktif
                // (belum cukup terlihat di layar, atau fokus keyboard sedang ada di elemen lain
                // seperti input/tombol). Coba klik kanvas game dulu, baru tekan M.
                console.log(
                    "[dino-game] Tombol M diabaikan: kanvas dianggap tidak aktif (tidak terlihat di layar / fokus ada di elemen lain).",
                );
            }
        }
    });
    document.addEventListener("keyup", (e) => {
        if (e.code === "ArrowDown") ducking = false;
    });
    window.addEventListener("blur", () => {
        ducking = false;
    });
    canvas.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        canvas.focus({ preventScroll: true });
        press();
    });

    if ("IntersectionObserver" in window) {
        new IntersectionObserver(
            ([en]) => {
                visible = en.isIntersecting;
            },
            { threshold: 0.4 },
        ).observe(canvas);
    }

    /* ---------- logika ---------- */
    const isDucking = () => ducking && cat.y >= GROUND && state === "running";

    // Kotak dunia (bukan lagi dipersempit manual) untuk sprite kucing/rintangan yang sedang
    // tampil. Pas dengan ukuran gambar sepenuhnya karena kepresisiannya sekarang ditangani oleh
    // pixelOverlap() (cek piksel alfa), bukan dengan mengecilkan kotaknya.
    function catRect(sprite) {
        return {
            x: cat.x,
            y: cat.y - sprite.height,
            w: sprite.width,
            h: sprite.height,
        };
    }
    function obstacleSprite(o) {
        return o.kind === "bird" ? IMG.bird[o.f] : o.img;
    }
    function obstacleRect(o, sprite) {
        return { x: o.x, y: o.y, w: sprite.width, h: sprite.height };
    }

    function randomBush() {
        return BUSHES[Math.floor(Math.random() * BUSHES.length)];
    }

    function spawn() {
        if (score > 250 && Math.random() < 0.28) {
            // 3 tingkat dengan strategi berbeda (kucing berdiri lebih tinggi dari merunduk):
            //   rendah  → wajib lompat
            //   sedang  → merunduk (aman) atau lompat (perlu timing pas)
            //   tinggi  → cukup lewat di bawahnya tanpa aksi apa pun
            const tops = [GROUND - 25, GROUND - 45, GROUND - 85];
            obstacles.push({
                kind: "bird",
                x: W + 10,
                y: tops[Math.floor(Math.random() * tops.length)],
                f: 0,
                t: 0,
            });
            playClip(birdClip);
        } else {
            const img =
                score > 150 && Math.random() < 0.4
                    ? combine([randomBush(), randomBush()])
                    : randomBush();
            obstacles.push({
                kind: "bush",
                img,
                x: W + 10,
                y: GROUND - img.height,
            });
        }
    }
    function scroll(dt, sp) {
        clouds.forEach((c) => {
            c.x -= sp * 0.2 * dt + 6 * dt;
            if (c.x < -60) {
                c.x = W + rand(0, 100);
                c.y = rand(20, 80);
            }
        });
        dirt.forEach((d) => {
            d.x -= sp * dt;
            if (d.x + d.w < 0) {
                d.x = W + rand(0, 60);
                d.y = rand(5, 16);
                d.w = Math.random() < 0.5 ? 2 : rand(4, 12);
            }
        });
    }

    function update(dt) {
        const g = ducking && cat.y < GROUND ? GRAVITY * 2.4 : GRAVITY; // turun lebih cepat saat ↓ ditekan
        cat.vy += g * dt;
        cat.y += cat.vy * dt;
        if (cat.y >= GROUND) {
            cat.y = GROUND;
            cat.vy = 0;
        }

        speed = Math.min(720, speed + 6 * dt);
        score += (speed * dt) / 40;
        animT += dt;
        scroll(dt, speed);

        sinceSpawn += speed * dt;
        if (sinceSpawn >= gap) {
            spawn();
            sinceSpawn = 0;
            gap = speed * 0.64 + rand(130, 330);
        }

        obstacles.forEach((o) => {
            if (o.kind === "bird") {
                o.x -= (speed + 50) * dt;
                o.t += dt;
                o.f = Math.floor(o.t / 0.08) % IMG.bird.length;
            } else o.x -= speed * dt;
        });
        obstacles = obstacles.filter((o) => o.x > -140);

        const m = Math.floor(score / 100);
        if (m > lastMile) {
            lastMile = m;
            flash = 0.9;
            sfx("point");
        }
        if (flash > 0) flash -= dt;

        const cs = catSprite();
        const cr = catRect(cs);
        if (
            obstacles.some((o) => {
                const os = obstacleSprite(o);
                return pixelOverlap(cr, cs, obstacleRect(o, os), os);
            })
        )
            die();
    }

    function die() {
        state = "over";
        // Tabrakan bisa terjadi saat kucing masih di udara (mis. lompat tapi nyangkut ujung
        // semak saat turun). Tanpa ini, posisi Y-nya ikut membeku di udara dan pose "rebah"
        // kelihatan melayang, tidak menapak tanah.
        cat.y = GROUND;
        cat.vy = 0;
        diedAt = performance.now();
        deathT = 0;
        sfx("die");
        const s = Math.floor(score);
        if (s > hi) {
            hi = s;
            try {
                localStorage.setItem("dinoBest", String(hi));
            } catch (e) {}
        }
    }

    /* ---------- gambar ---------- */
    function restartIcon(cx, cy) {
        const r = 12,
            a0 = 0.25 * Math.PI,
            a1 = 1.7 * Math.PI;
        ctx.strokeStyle = C_TEXT;
        ctx.fillStyle = C_TEXT;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(cx, cy, r, a0, a1);
        ctx.stroke();
        const ex = cx + r * Math.cos(a1),
            ey = cy + r * Math.sin(a1);
        const tx = -Math.sin(a1),
            ty = Math.cos(a1),
            nx = ty,
            ny = -tx;
        ctx.beginPath();
        ctx.moveTo(ex + tx * 9, ey + ty * 9);
        ctx.lineTo(ex + nx * 6, ey + ny * 6);
        ctx.lineTo(ex - nx * 6, ey - ny * 6);
        ctx.closePath();
        ctx.fill();
    }
    function catSprite() {
        if (state === "over")
            return IMG.dead[
                Math.min(IMG.dead.length - 1, Math.floor(deathT / 0.18))
            ];
        if (cat.y < GROUND) return cat.vy < 0 ? IMG.jumpUp : IMG.jumpDown;
        if (state === "idle") return IMG.run[0];
        if (isDucking())
            return IMG.crouch[Math.floor(animT / 0.1) % IMG.crouch.length];
        return IMG.run[Math.floor(animT / 0.08) % IMG.run.length];
    }

    function draw() {
        ctx.clearRect(0, 0, W, H); // latar transparan: yang terlihat adalah foto di belakang

        ctx.globalAlpha = 0.55;
        clouds.forEach((c) => ctx.drawImage(IMG.cloud, px(c.x), px(c.y)));
        ctx.globalAlpha = 1;

        ctx.fillStyle = C_MUTED;
        ctx.fillRect(0, GROUND, W, 2);
        ctx.globalAlpha = 0.5;
        dirt.forEach((d) =>
            ctx.fillRect(px(d.x), GROUND + px(d.y), px(d.w), 2),
        );
        ctx.globalAlpha = 1;

        obstacles.forEach((o) =>
            ctx.drawImage(
                o.kind === "bird" ? IMG.bird[o.f] : o.img,
                px(o.x),
                px(o.y),
            ),
        );

        const s = catSprite();
        ctx.drawImage(s, px(cat.x), px(cat.y - s.height));

        if (SHOW_TEXT) {
            if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
            ctx.font = "bold 13px " + MONO;
            ctx.textAlign = "right";
            ctx.textBaseline = "alphabetic";
            const cur = String(Math.floor(score)).padStart(5, "0");
            const blinkOff = flash > 0 && Math.floor(flash * 7) % 2 === 1;
            if (!blinkOff) {
                ctx.fillStyle = C_AMBER;
                ctx.fillText(cur, W - 14, 24);
            }
            if (hi > 0) {
                const w = ctx.measureText(cur + "   ").width;
                ctx.fillStyle = C_MUTED;
                ctx.fillText(
                    "HI " + String(hi).padStart(5, "0"),
                    W - 14 - w,
                    24,
                );
            }
            ctx.textAlign = "center";
            if (state === "idle") {
                ctx.fillStyle = C_AMBER;
                if (Math.floor(clock * 1.6) % 2 === 0)
                    ctx.fillText("TEKAN SPASI UNTUK MULAI", W / 2, 92);
                // Petunjuk kontrol: statis (tidak ikut berkedip) supaya selalu terbaca.
                ctx.fillStyle = C_MUTED;
                ctx.font = "11px " + MONO;
                ctx.fillText("SPASI / ↑ LOMPAT   ↓ MERUNDUK", W / 2, 110);
            } else if (state === "over") {
                ctx.fillStyle = C_TEXT;
                ctx.font = "bold 20px " + MONO;
                ctx.fillText("G A M E   O V E R", W / 2, 78);
            }
        }

        if (state === "over") restartIcon(W / 2, SHOW_TEXT ? 112 : 84);
    }

    function frame(now) {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (visible && !document.hidden && !modalOpen()) {
            clock += dt;
            if (state === "running") update(dt);
            else if (state === "idle") scroll(dt, 0);
            else if (state === "over") deathT += dt; // animasi rebah tetap berjalan; latar & rintangan beku
            draw();
        }
        requestAnimationFrame(frame);
    }

    /* ---------- mulai ---------- */
    Promise.all(
        Object.entries(FILES).map(([k, f]) =>
            load(`${BASE}/${f}.png`).then((i) => [k, i]),
        ),
    )
        .then((entries) => {
            const a = Object.fromEntries(entries);

            // Pangkas padding transparan per KELOMPOK frame (bukan per-file) sebelum di-scale.
            // Ini yang membereskan dua masalah sekaligus:
            //  1) hitbox yang lebih besar dari gambar yang kelihatan (mati padahal belum nyentuh),
            //  2) kucing "mati" kelihatan mengambang di atas tanah (ada padding transparan di
            //     bawah tubuhnya pada file cat_lying_dead_*).
            // Dipangkas per-KELOMPOK (union bbox), bukan per-file sendiri-sendiri, supaya semua
            // frame dalam satu animasi dipotong di kotak yang sama — kalau per-file, kucing/burung
            // bisa kelihatan "bergetar" saat berganti frame karena bbox tiap file berbeda-beda.
            const runBox = unionBBox([
                a.run1,
                a.run2,
                a.run3,
                a.run4,
                a.run5,
                a.jumpUp,
                a.jumpDown,
            ]);
            const crouchBox = unionBBox([
                a.crouch1,
                a.crouch2,
                a.crouch3,
                a.crouch4,
            ]);
            const deadBox = unionBBox([a.dead1, a.dead2, a.dead3, a.dead4]);
            const birdBox = unionBBox([
                a.bird1,
                a.bird2,
                a.bird3,
                a.bird4,
                a.bird5,
            ]);

            // Satu skala tunggal dipakai untuk SEMUA pose kucing (lari, merunduk, rebah),
            // diturunkan dari pose lari. Kalau tiap pose dipaksa ke tinggi tampil sendiri-sendiri
            // (cara lama), "besar tubuh" kucingnya ikut berubah tiap ganti pose — padahal kotak
            // pose merunduk/rebah memang lebih pendek karena posturnya, bukan karena badannya
            // mengecil/membesar. Dengan CAT_SCALE, tinggi tampil tiap pose mengikuti proporsi
            // aslinya (relatif ke pose lari), jadi kucingnya kelihatan sama besar di semua pose.
            const CAT_SCALE = SIZE.cat / runBox.h;

            IMG = {
                run: [a.run1, a.run2, a.run3, a.run4, a.run5].map((im) =>
                    scaledSprite(im, SIZE.cat, runBox),
                ),
                jumpUp: scaledSprite(a.jumpUp, SIZE.cat, runBox),
                jumpDown: scaledSprite(a.jumpDown, SIZE.cat, runBox),
                crouch: [a.crouch1, a.crouch2, a.crouch3, a.crouch4].map((im) =>
                    scaledSprite(im, crouchBox.h * CAT_SCALE, crouchBox),
                ),
                dead: [a.dead1, a.dead2, a.dead3, a.dead4].map((im) =>
                    scaledSprite(im, deadBox.h * CAT_SCALE, deadBox),
                ),
                // flip=true: aset burung aslinya menghadap kanan, tapi rintangan bergerak dari
                // kanan ke kiri layar — dibalik supaya paruhnya menghadap arah terbangnya.
                bird: [a.bird1, a.bird2, a.bird3, a.bird4, a.bird5].map((im) =>
                    scaledSprite(im, SIZE.bird, birdBox, true),
                ),
                cloud: scaledSprite(a.cloud, SIZE.cloud),
            };
            // Semak tidak dianimasikan (tiap file muncul sendiri-sendiri sebagai rintangan
            // berbeda, tidak berganti frame), jadi aman dipangkas per-file tanpa risiko "bergetar".
            BUSHES = [a.bush1, a.bush2, a.bush3, a.bush4, a.bush5].map((im) =>
                scaledSprite(im, SIZE.bush, alphaBBox(im)),
            );
            initScenery();
            reset();
            requestAnimationFrame((t0) => {
                last = t0;
                requestAnimationFrame(frame);
            });
        })
        .catch((err) => console.error("[dino-game]", err));
})();
