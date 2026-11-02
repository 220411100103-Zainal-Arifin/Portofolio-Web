import { initBackground } from "./background.js";
import { initModal } from "./modal.js";
import { initKeyboard } from "./keyboard.js";
import { initClock } from "./clock.js";
import { initWeather } from "./weather.js";
import { initPalette } from "./palette.js";
import "./dino-game.js";
const safe = (init) => {
    try {
        init();
    } catch (err) {
        console.error(`[portfolio] ${init.name} gagal:`, err);
    }
};
if (document.querySelector(".main-layout")) {
    [
        initBackground,
        initPalette,
        initModal,
        initKeyboard,
        initClock,
        initWeather,
    ].forEach(safe);
}
