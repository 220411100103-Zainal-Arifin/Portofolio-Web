<div class="hero">
  {{-- Game kucing: latar transparan. Spasi (laptop) / ketuk (tablet & ponsel).
       Logika: resources/js/portfolio/dino-game.js — aset: public/assets/dino/*.png
       PENTING: <canvas> harus tetap di dalam <div class="hero-game">. Pembungkus inilah yang
       membuat CSS (components/dino-game.css) mengecilkan kanvas mengikuti lebar layar. --}}
  <div class="hero-game">
    <canvas
      data-dino-game
      data-assets="/assets/dino"
      data-text="on"
      data-cat-sound="/assets/dino/cat_meow.wav"
      data-bird-sound="/assets/dino/bird_chirp.wav"
      width="600"
      height="200"
      tabindex="-1"
    ></canvas>
  </div>

  <p class="hero-tag">Web Dev · Machine Learning & NLP · IT Support</p>
  <h1 class="hero-name">
    <span class="hero-name-first">ZAINAL</span>
    <span class="hero-name-last">ARIFIN</span>
  </h1>
  <p class="hero-desc">
    Mahasiswa Informatika yang suka mendaki gunung dan berburu cahaya
    lewat lensa. Membangun perangkat lunak sambil belajar membaca alam.
  </p>
  <div class="icon-row">
    <a href="https://mail.google.com/mail/?view=cm&to=arifinwize1@gmail.com" class="icon-link" aria-label="Email">✉ email</a>
    <a href="https://github.com/220411100103-Zainal-Arifin" class="icon-link" aria-label="GitHub">◈ github</a>
    <a href="https://linkedin.com/in/zainal-arifin-9100a3429" class="icon-link" aria-label="LinkedIn">◉ linkedin</a>
    <a href="https://drive.google.com/file/d/1dXBlRpoNsDhmMfvr05A3DdsrnKHPB_fR/view?usp=sharing" class="icon-link" aria-label="Resume">↗ resume</a>
  </div>
</div>
