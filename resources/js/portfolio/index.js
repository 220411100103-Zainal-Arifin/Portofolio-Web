import { initBackground } from "./background.js";
import { initModal } from "./modal.js";
import { initKeyboard } from "./keyboard.js";
import { initClock } from "./clock.js";
import { initWeather } from "./weather.js";
import "./dino-game.js";

// app.js bisa dipakai halaman lain; lewati jika bukan halaman portofolio.
if (document.querySelector(".main-layout")) {
    initBackground();
    initModal();
    initKeyboard();
    initClock();
    initWeather();
}
