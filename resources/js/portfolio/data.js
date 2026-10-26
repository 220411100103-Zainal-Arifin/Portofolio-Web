/**
 * Konten modal per seksi. Kunci (projects, cert, photo, about)
 * harus sama dengan 'key' di config/portfolio.php.
 *
 * imageOnly: true     → kartu hanya menampilkan gambar (tanpa tag/title/desc).
 *                       Isi `alt` sebagai keterangan untuk pembaca layar.
 * justified: true     → gambar disusun dengan layout baris rata sesuai rasio aslinya
 *                       (tanpa crop). Dipakai pada seksi Fotografi.
 * variant: "project"  → item tanpa gambar tampil sebagai kartu proyek (nomor urut,
 *                       tag, judul, deskripsi, dan chip teknologi). Item yang punya
 *                       gambar tetap memakai kartu bergambar.
 * Tanpa imageOnly     → kartu menampilkan gambar + teks (tag, title, desc).
 *
 * image:  "..."          → satu foto.
 * images: ["...", "..."] → beberapa foto; kartu otomatis menjadi carousel bertumpuk
 *                          (foto bergulir dari belakang ke depan). Jika `images`
 *                          diisi, `image` tidak perlu ditulis.
 *
 * Khusus seksi dengan variant "project", tiap item boleh memiliki:
 *   stack: ["Laravel", "MySQL"]  → chip teknologi/kata kunci di bagian bawah kartu.
 *   link:  "https://..."         → tautan "Lihat proyek" (dibuka di tab baru).
 * Saat tampilan proyek sudah jadi, cukup tambahkan `image`/`images` + `alt`
 * pada item tersebut; kartunya otomatis berganti menjadi kartu bergambar.
 */
export const sections = {
    projects: {
        title: "KARYA & PROYEK",
        subtitle: "Proyek yang pernah dikerjakan",
        variant: "project",
        items: [
            {
                tag: "Full-stack",
                title: "Kasir POS",
                desc: "Aplikasi kasir berbasis Laravel dengan fitur pengelolaan produk, transaksi, pengguna, dan laporan.",
                stack: ["Laravel", "Transaksi", "Laporan"],
            },
            {
                tag: "Machine Learning",
                title: "Prediksi Hasil Panen Padi",
                desc: "Model machine learning menggunakan Logistic Regression untuk memprediksi hasil panen padi berdasarkan data historis beberapa wilayah.",
                stack: ["Logistic Regression", "Data Historis"],
            },
            {
                tag: "NLP",
                title: "Klasifikasi Diagnosis TB",
                desc: "Sistem klasifikasi diagnosis tuberkulosis menggunakan SVM dengan menggabungkan data keluhan pasien dan data klinis.",
                stack: ["SVM", "Data Klinis", "Keluhan Pasien"],
            },
            {
                tag: "NLP",
                title: "Analisis Sentimen X",
                desc: "Analisis sentimen terhadap unggahan X menggunakan TF-IDF dan SVM untuk mengklasifikasikan opini menjadi sentimen positif, negatif, dan netral.",
                stack: ["TF-IDF", "SVM", "3 Kelas Sentimen"],
            },
            {
                tag: "Web",
                title: "Sistem Informasi Pariwisata",
                desc: "Website informasi dan pencarian destinasi wisata dengan database, peta interaktif, serta fitur pencarian rute perjalanan.",
                stack: ["Database", "Peta Interaktif", "Rute Perjalanan"],
            },
            {
                tag: "Web",
                title: "Sistem Presensi QR",
                desc: "Sistem presensi mahasiswa menggunakan QR Code berdasarkan mata kuliah dan pertemuan dengan autentikasi akun pengguna.",
                stack: ["QR Code", "Autentikasi"],
            },
            {
                tag: "NLP",
                title: "News Summarization",
                desc: "Sistem peringkasan berita otomatis menggunakan TF-IDF dan TextRank untuk mengambil informasi penting dari sebuah artikel.",
                stack: ["TF-IDF", "TextRank"],
            },
            {
                tag: "NLP",
                title: "Search Engine Sederhana",
                desc: "Mesin pencarian dokumen menggunakan TF-IDF, BM25, dan cosine similarity untuk menemukan dokumen yang paling relevan.",
                stack: ["TF-IDF", "BM25", "Cosine Similarity"],
            },
        ],
    },
    cert: {
        title: "SERTIFIKAT",
        subtitle: "Pencapaian & penghargaan",
        imageOnly: true,
        items: [
            {
                image: "images/portfolio/Introduction_to_Modern_AI_certificate_page-0001.jpg",
                alt: "Sertifikat 1",
            },
            {
                image: "images/portfolio/Networking_Essentials_certificate_page-0001.jpg",
                alt: "Sertifikat 2",
            },
            {
                image: "images/portfolio/sertifikat_course_123_6010940_010926224626_page-0001.jpg",
                alt: "Sertifikat 3",
            },
            {
                image: "images/portfolio/sertifikat_course_256_6010940_090926135211_page-0001.jpg",
                alt: "Sertifikat 4",
            },
            {
                image: "images/portfolio/certificate-DQLABAI001MVIMCA_page-0001.jpg",
                alt: "Sertifikat 5",
            },
            {
                image: "images/portfolio/certificate-DQLABAI002EPSALH_page-0001.jpg",
                alt: "Sertifikat 6",
            },
            {
                image: "images/portfolio/certificate-DQLABAI003JWARNV_page-0001.jpg",
                alt: "Sertifikat 7",
            },
            {
                image: "images/portfolio/certificate-DQLABBGINRMOQWQA_page-0001.jpg",
                alt: "Sertifikat 8",
            },
            {
                image: "images/portfolio/certificate-DQLABINTP1ORWEPA_page-0001.jpg",
                alt: "Sertifikat 9",
            },
            {
                image: "images/portfolio/certificate-DQLABINTP1UUNTJH_page-0001.jpg",
                alt: "Sertifikat 10",
            },
            {
                image: "images/portfolio/certificate-DQLABINTP1VCPSBN_page-0001.jpg",
                alt: "Sertifikat 11",
            },
            {
                image: "images/portfolio/certificate-DQLABINTR1MGCWGI_page-0001.jpg",
                alt: "Sertifikat 12",
            },
            {
                image: "images/portfolio/certificate-DQLABSQLT1FGUHBC_page-0001.jpg",
                alt: "Sertifikat 13",
            },
        ],
    },
    photo: {
        title: "FOTOGRAFI",
        subtitle: "Momen yang tertangkap lensa",
        imageOnly: true,
        justified: true,
        items: [
            {
                image: "images/portfolio/fotografi/_MG_3259.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
            {
                image: "images/portfolio/fotografi/_MG_3305.jpg",
                alt: "Fotografi jalanan di sudut kota",
            },
            {
                image: "images/portfolio/fotografi/_MG_4608.jpg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/_MG_4613.jpg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/_MG_4653.jpg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/DSCF0151-4.jpg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/DSCF0395.jpg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/DSCF1109.jpg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/DSCF2072.jpg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/DSCF2112.jpg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/DSCF4279.jpg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/IMG_20260726_082013.jpg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/IMG_20260326_140050.jpeg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/IMG_20260527_201937.jpeg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/IMG_20260704_182626.jpeg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/IMG_20260704_182857.jpeg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/IMG_20260704_183143.jpeg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/IMG_20260704_183635.jpeg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/IMG_20260704_184512.jpeg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/IMG_20260726_063615.jpeg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/IMG_20260808_231311.jpeg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
            {
                image: "images/portfolio/fotografi/IMG_20260809_001625.jpeg",
                alt: "Hamparan kabut di lembah saat fajar",
            },
        ],
    },
    about: {
        title: "TENTANG SAYA",
        subtitle: "Mengenal saya lebih dekat",
        items: [
            {
                tag: "Pendidikan",
                title: "Lulusan Teknik Informatika",
                desc: "Lulusan Teknik Informatika Universitas Trunojoyo Madura dengan ketertarikan pada pengembangan web, machine learning, dan NLP.",
                images: [
                    "/images/portfolio/about/DSCF4322.jpg",
                    "/images/portfolio/about/24-09-25 Bimbingan.jpeg",
                    "/images/portfolio/about/20220807_153324.jpg",
                    "/images/portfolio/about/DSCF1138.jpg",
                    "/images/portfolio/about/IMG_20221126_221122.jpg",
                ],
                alt: "Latar belakang pendidikan",
            },
            {
                tag: "Pengalaman",
                title: "IT Support & Pengembangan Sistem",
                desc: "Memiliki pengalaman dalam IT support, troubleshooting jaringan, serta membangun dan mengembangkan aplikasi berbasis web.",
            },
            {
                tag: "Organisasi",
                title: "Pemimpin & Kreator",
                desc: "Aktif dalam organisasi jurnalistik selama tiga tahun, dengan pengalaman sebagai koordinator ilustrasi dan pimpinan umum.",
                images: [
                    "/images/portfolio/about/IMG-20230223-WA0017.jpg",
                    "/images/portfolio/about/IMG_20230130_113716_572.jpg",
                    "/images/portfolio/about/IMG_20221220_054338.jpg",
                    "/images/portfolio/about/IMG_20230704_173249.jpg",
                    "/images/portfolio/about/IMG_20230704_173017.jpg",
                    "/images/portfolio/about/IMG20221220061818_01.jpg",
                ],
                alt: "Kegiatan organisasi",
            },
            {
                tag: "Minat",
                title: "Machine Learning & NLP",
                desc: "Tertarik mengolah data dan membangun solusi berbasis machine learning, khususnya dalam bidang text mining, NLP, dan klasifikasi.",
            },
            {
                tag: "Hobi",
                title: "Fotografi & Ilustrasi",
                desc: "Menikmati fotografi dan ilustrasi sebagai cara untuk mengeksplorasi kreativitas di luar dunia teknologi.",
                images: [
                    "/images/portfolio/about/_MG_4608.jpg",
                    "/images/portfolio/about/DSCF2107.jpg",
                    "/images/portfolio/about/DSCF0151.jpg",
                    "/images/portfolio/about/ar.jpg",
                    "/images/portfolio/about/artikel-erv.jpg",
                    "/images/portfolio/about/buletin23.jpg",
                    "/images/portfolio/about/cerpen-di.jpg",
                    "/images/portfolio/about/gabut2.jpg",
                    "/images/portfolio/about/mba ern.jpg",
                    "/images/portfolio/about/NewCanvas2.jpg",
                    "/images/portfolio/about/pro3.jpg",
                    "/images/portfolio/about/sastra1.jpg",
                ],
                alt: "Fotografi dan ilustrasi",
            },
        ],
    },
};
