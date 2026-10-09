function updateClock() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");

    document.getElementById("clock-hm").textContent =
        `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    document.getElementById("clock-sec").textContent = pad(now.getSeconds());
    document.getElementById("clock-date").textContent = now.toLocaleDateString(
        "id-ID",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        },
    );
}

export function initClock() {
    updateClock();
    setInterval(updateClock, 1000);
}
