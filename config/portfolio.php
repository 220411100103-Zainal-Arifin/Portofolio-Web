<?php

/*
 * Satu sumber data untuk sidebar, kartu pecahan, dan petunjuk keyboard.
 * Urutan array = urutan tampil (nomor 01, 02, ... dibuat otomatis).
 *
 * 'slot' menentukan keping mana yang ditempati kartu
 * (bentuknya didefinisikan di resources/css/components/strip-cards.css):
 *   tl = kiri-atas    tr = kanan-atas (paling tipis)
 *   mr = kanan-tengah bl = kiri-bawah (paling luas)
 * Tukar nilai 'slot' antar seksi untuk memindahkan posisinya.
 *
 * Konten modal (isi kartu proyek dll) ada di resources/js/portfolio/data.js
 */
return [
    'sections' => [
        ['key' => 'projects', 'slot' => 'tl', 'tab' => 'Projects', 'title' => 'Karya & Proyek', 'desc' => 'NLP · machine learning · aplikasi full-stack', 'shortcut' => 'P', 'aria' => 'Projects'],
        ['key' => 'cert',     'slot' => 'tr', 'tab' => 'Cert',     'title' => 'Sertifikat',     'desc' => 'Kursus, kompetisi, workshop',            'shortcut' => 'C', 'aria' => 'Certificates'],
        ['key' => 'photo',    'slot' => 'mr', 'tab' => 'Photo',    'title' => 'Fotografi',      'desc' => 'Momen dari puncak dan jalanan',          'shortcut' => 'F', 'aria' => 'Photography'],
        ['key' => 'about',    'slot' => 'bl', 'tab' => 'About',    'title' => 'Tentang Saya',   'desc' => 'Informatika · fotografi · mendaki',      'shortcut' => 'A', 'aria' => 'About'],
    ],
];
