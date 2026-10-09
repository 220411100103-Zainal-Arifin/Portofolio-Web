/**
 * Cuaca (Open-Meteo)
 * Ubah koordinat pada WEATHER untuk mengganti lokasi.
 */
const WEATHER = {
    label: "Gresik",
    lat: -7.1539,
    lon: 112.6561,
    timezone: "Asia/Jakarta",
    refreshMs: 15 * 60 * 1000, // Open-Meteo memperbarui data "current" tiap 15 menit
    cacheKey: "weather-cache-v1",
};

/** Memetakan kode cuaca WMO ke teks dan ikon. */
function describeWeather(code, isDay) {
    if (code === 0) return { text: "Cerah", icon: isDay ? "☀️" : "🌙" };
    if (code === 1) return { text: "Cerah berawan", icon: isDay ? "🌤️" : "🌙" };
    if (code === 2) return { text: "Berawan sebagian", icon: "⛅" };
    if (code === 3) return { text: "Mendung", icon: "☁️" };
    if (code === 45 || code === 48) return { text: "Berkabut", icon: "🌫️" };
    if (code >= 51 && code <= 57) return { text: "Gerimis", icon: "🌦️" };
    if (code >= 61 && code <= 67) return { text: "Hujan", icon: "🌧️" };
    if (code >= 71 && code <= 77) return { text: "Salju", icon: "❄️" };
    if (code >= 80 && code <= 82) return { text: "Hujan lokal", icon: "🌦️" };
    if (code === 85 || code === 86) return { text: "Hujan salju", icon: "❄️" };
    if (code === 95) return { text: "Badai petir", icon: "⛈️" };
    if (code === 96 || code === 99)
        return { text: "Badai petir & es", icon: "⛈️" };
    return { text: "—", icon: "🌡️" };
}

/** Membuat elemen dengan teks aman (tanpa innerHTML). */
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text;
    return node;
}

/** Menampilkan data cuaca pada elemen #weather. */
function renderWeather(data) {
    const box = document.getElementById("weather");
    const cur = data.current;
    const day = data.daily;
    const info = describeWeather(cur.weather_code, cur.is_day === 1);

    const temp = Math.round(cur.temperature_2m);
    const max = Math.round(day.temperature_2m_max[0]);
    const min = Math.round(day.temperature_2m_min[0]);
    const rain = day.precipitation_probability_max[0];

    const text = document.createElement("div");
    text.append(
        el("div", "weather-temp", `${temp}°C`),
        el("div", "weather-desc", `${info.text} · ${WEATHER.label}`),
    );

    const main = document.createElement("div");
    main.className = "weather-main";
    main.append(el("span", "weather-icon", info.icon), text);

    const meta = document.createElement("div");
    meta.className = "weather-meta";
    meta.append(
        el("span", "", `H ${max}° · L ${min}°`),
        el("span", "", `Hujan ${rain}%`),
    );

    box.replaceChildren(main, meta);
}

/** Mengambil data dari API; memakai cache bila masih segar. */
async function loadWeather() {
    const box = document.getElementById("weather");

    try {
        const cached = JSON.parse(
            localStorage.getItem(WEATHER.cacheKey) || "null",
        );
        if (cached && Date.now() - cached.time < WEATHER.refreshMs) {
            renderWeather(cached.data);
            return;
        }
    } catch {
        /* cache rusak, abaikan */
    }

    const params = new URLSearchParams({
        latitude: WEATHER.lat,
        longitude: WEATHER.lon,
        current: "temperature_2m,weather_code,is_day",
        daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        timezone: WEATHER.timezone,
        forecast_days: 1,
    });

    try {
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?${params}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        renderWeather(data);
        localStorage.setItem(
            WEATHER.cacheKey,
            JSON.stringify({ time: Date.now(), data }),
        );
    } catch (err) {
        console.error("Gagal memuat cuaca:", err);
        box.textContent = "Cuaca tidak tersedia";
    }
}

export function initWeather() {
    loadWeather();
    setInterval(loadWeather, WEATHER.refreshMs);
}
