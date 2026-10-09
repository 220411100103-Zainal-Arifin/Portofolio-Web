/**
 * Konten modal per seksi. Kunci (projects, cert, photo, about)
 * harus sama dengan 'key' di config/portfolio.php.
 */
export const sections = {
    projects: {
        title: "KARYA & PROYEK",
        subtitle: "Proyek yang pernah dikerjakan",
        items: [
            {
                tag: "NLP",
                title: "Klasifikasi Gejala TB",
                desc: "Pipeline NLP untuk deteksi gejala tuberkulosis dari teks Bahasa Indonesia menggunakan pendekatan lexicon.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
            {
                tag: "Machine Learning",
                title: "Analisis Sentimen Basket",
                desc: "Sentimen lexicon-based untuk unggahan bola basket berbahasa Indonesia di media sosial.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
            {
                tag: "Full-stack",
                title: "Kasira POS",
                desc: "Sistem kasir multi-role dengan Laravel, Tailwind CSS, dan Alpine.js.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
            {
                tag: "Tugas Akhir",
                title: "Klasifikasi Wi-Fi HOQ",
                desc: "Klasifikasi multi-label kuisioner kepuasan Wi-Fi kampus dengan House of Quality.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
            {
                tag: "Portfolio",
                title: "Video Streaming Platform",
                desc: "Platform streaming video sebagai proyek portofolio pertama.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
        ],
    },
    cert: {
        title: "SERTIFIKAT",
        subtitle: "Pencapaian & penghargaan",
        items: [
            {
                tag: "Online Course",
                title: "Nama Sertifikat 1",
                desc: "Deskripsi singkat sertifikat atau kursus yang diselesaikan.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
            {
                tag: "Kompetisi",
                title: "Nama Sertifikat 2",
                desc: "Deskripsi singkat pencapaian kompetisi.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
            {
                tag: "Workshop",
                title: "Nama Sertifikat 3",
                desc: "Deskripsi singkat workshop yang diikuti.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
        ],
    },
    photo: {
        title: "FOTOGRAFI",
        subtitle: "Momen yang tertangkap lensa",
        items: [
            {
                tag: "Landscape",
                title: "Puncak Arjuno",
                desc: "Mendaki Gunung Arjuno dan mengabadikan golden hour dari punggungan.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
            {
                tag: "Street",
                title: "Sisi Lain Kota",
                desc: "Fotografi jalanan di sudut kota yang sering terlewat.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
            {
                tag: "Alam",
                title: "Kabut Pagi",
                desc: "Hamparan kabut di lembah saat fajar, hasil pendakian semalam.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
        ],
    },
    about: {
        title: "TENTANG SAYA",
        subtitle: "Siapa saya sebenarnya",
        items: [
            {
                tag: "Latar Belakang",
                title: "Mahasiswa Informatika",
                desc: "Menyelesaikan Tugas Akhir di bidang NLP dan machine learning di Universitas Trunojoyo Madura.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
            {
                tag: "Hobi",
                title: "Fotografi & Mendaki",
                desc: "Mendaki gunung sambil berburu momen lewat lensa kamera.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
            {
                tag: "Saat Ini",
                title: "Freelance & Belajar",
                desc: "Mengerjakan proyek data science freelance sambil membangun portofolio.",
                image: "/images/portfolio/DSCF4322.jpg",
                alt: "Golden hour dari punggungan Gunung Arjuno",
            },
        ],
    },
};
