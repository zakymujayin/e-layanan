<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Surat Tugas Seminar Proposal - Berita Acara - Daftar Hadir</title>
    <style>
@page {
    size: A4;
    margin: 0;
}

* {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}

body {
    font-family: "Times New Roman", Times, serif;
    font-size: 11pt;
    line-height: 1.15;
    color: #000;
    margin: 0;
    padding: 0;
    background-color: #525252;
}

.page {
    width: 210mm;
    height: 297mm;
    background: white;
    padding: 25mm 25mm 25mm 25mm;
    margin: 10mm auto;
    box-sizing: border-box;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    position: relative;
    page-break-after: always;
    display: block;
}

.page.narrow {
    width: 170mm;
    margin: 0 auto;
    min-height: auto;
}

.page-first {
    padding: 15mm 15mm 15mm 15mm !important;
}

@media print {
    body {
        background: none;
    }
    .page {
        margin: 0;
        box-shadow: none !important;
        padding: 25mm 25mm 25mm 25mm;
        width: 210mm;
        height: 297mm;
    }
}

/* Header Styles - Double Line Border */
.header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
    position: relative;
    border-bottom: 3px solid #000;
}

.header-table.double-line::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    border-bottom: 1px solid #000;
}

.header-table.thin-border {
    border-bottom: 3px solid #000;
    margin-bottom: 20px;
}

.header-table.gray-border {
    border-bottom: 4px solid #808080;
}

.header-table td {
    border: none;
    padding: 0;
    vertical-align: middle;
}

.header-logo {
    width: clamp(80px, 10vw, 150px);

.header-logo img {
    width: clamp(80px, 10vw, 150px);
    height: auto;
    max-width: 100%;

.header-text {
    text-align: center;
}

.kop-1 {
    font-size: 13pt;
    font-weight: bold;
    margin: 0;
}

.kop-2 {
    font-size: 12pt;
    font-weight: bold;
    margin: 0;
}

.kop-3 {
    font-size: 14pt;
    font-weight: bold;
    margin: 0;
}

.kop-4 {
    font-size: 9pt;
    margin: 0;
    margin-bottom: 5px;
}

/* Footer Styles */
.footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px 25mm;
    border-top: 1px solid #ddd;
    background: white;
}

table.footer-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
}

table.footer-table td {
    border: none;
    padding: 5px;
    vertical-align: middle;
    font-size: 9pt;
    color: #555;
    background: white;
}

.qrcode-cell {
    width: 15mm;
    height: 15mm;
    text-align: center;
    background: transparent;
    vertical-align: middle;
}

.qrcode-cell img {
    width: 15mm;
    height: 15mm;
    display: block;
}

.footer-text {
    text-align: left;
    line-height: 1.3;
}

/* Signature Section Styles */
.signature-section {
    float: right;
    width: 40%;
    text-align: left;
    position: relative;
}

.signature-text {
    margin: 0;
    line-height: 1.3;
}

.signature-space {
    min-height: 70px;
    position: relative;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 80%;
    background: white;
    margin-left: 20%;
}

.clear {
    clear: both;
}

        /* Custom styles for this template */
        body {
            background-color: #525659;
            font-family: "Times New Roman", Times, serif;
        }
        .page:last-child {
            page-break-after: auto;
        }
        @media print {
            .page {
                page-break-after: always;
            }
            .page:last-child {
                page-break-after: auto;
            }
        }

        /* Title */
        .title-section {
            text-align: center;
            margin-bottom: 15px;
        }

        .title {
            font-size: 12pt;
            font-weight: bold;
            text-decoration: underline;
            letter-spacing: 3px;
            margin: 0;
        }

        .nomor {
            font-size: 11pt;
            margin: 0;
        }

        /* Content */
        .main-paragraph {
            text-align: justify;
            margin-bottom: 15px;
            line-height: 1.5;
            font-size: 11pt;
        }

        /* Table */
        table.main-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            table-layout: fixed;
        }

        table.main-table th,
        table.main-table td {
            border: 0.5pt solid black;
            padding: 5px;
            vertical-align: top;
            text-align: left;
            font-size: 10pt;
            word-wrap: break-word;
        }

        table.main-table th {
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
        }

        .col-no {
            width: 5%;
            text-align: center !important;
        }

        .col-mahasiswa {
            width: 35%;
            text-align: center !important;
        }

        .col-penguji {
            width: 50%;
            padding: 0 !important;
        }

        .col-waktu {
            width: 10%;
            text-align: center !important;
        }

        /* Sub headers row */
        tr.sub-header td {
            font-style: italic;
            font-size: 9pt;
            padding: 2px;
            text-align: center !important;
            vertical-align: middle;
            height: 10%;
        }

        /* Inner table penguji */
        table.inner-table {
            width: 100%;
            border-collapse: collapse;
            height: 100%;
        }

        table.inner-table td {
            border: none;
            text-align: left;
            padding: 2px 5px;
            vertical-align: middle;
        }

        .penguji-label {
            width: 60px;
        }

        .penguji-separator {
            width: 5px;
            text-align: center;
        }

        /* Signature */
        .signature-stamp {
            position: absolute;
            left: -40px;
            top: 20px;
            width: 110px;
            opacity: 0.7;
            z-index: -1;
        }

        .signature-text {
            margin: 0;
            line-height: 1.3;
        }

        .clear {
            clear: both;
        }

        /* Tembusan & Catatan */
        .tembusan {
            margin-top: 15px;
            font-size: 9pt;
            page-break-inside: avoid;
        }

        .tembusan-title {
            margin: 0;
        }

        .tembusan-list {
            margin-top: 2px;
            margin-bottom: 15px;
            padding-left: 20px;
        }

        .tembusan-list li {
            margin-bottom: 2px;
        }

        .catatan {
            margin-top: 15px;
            font-size: 9pt;
            page-break-inside: avoid;
        }

        .catatan-title {
            margin: 0;
        }

        .catatan-list {
            margin-top: 2px;
            padding-left: 25px;
            list-style-type: disc;
        }

        .catatan-list li {
            margin-bottom: 2px;
        }

        .sub-catatan-list {
            padding-left: 20px;
            list-style-type: circle;
            margin-top: 2px;
        }

        /* Berita Acara Styles */
        .doc-title {
            text-align: center;
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 25px;
            line-height: 1.3;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .data-table td {
            padding: 4px 0;
            vertical-align: top;
            font-size: 12pt;
        }

        .data-table td:nth-child(1) { width: 180px; }
        .data-table td:nth-child(2) { width: 15px; text-align: center; }
        .data-table td:nth-child(3) { width: auto; }

        .decision-title {
            text-align: center;
            font-weight: bold;
            font-size: 12pt;
            margin: 25px 0 15px 0;
        }

        .paragraph {
            text-align: justify;
            font-size: 12pt;
            line-height: 1.5;
            margin-bottom: 10px;
        }

        .spacing-title {
            height: 60px;
        }

        .date-right {
            text-align: right;
            font-size: 12pt;
            margin-bottom: 20px;
        }

        .sign-title {
            text-align: center;
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 10px;
        }

        .signature-grid {
            display: table;
            width: 100%;
            margin-top: 15px;
        }

        .signature-row {
            display: table-row;
        }

        .signature-title {
            display: table-cell;
            width: 50%;
            text-align: center;
            vertical-align: top;
            font-size: 12pt;
        }

        .signature-cell-full {
            display: table-cell;
            width: 100%;
            text-align: center;
            vertical-align: top;
            padding-top: 80px;
            font-size: 12pt;
            padding-bottom: 10px;
        }

        .signature-cell-2 {
            display: table-cell;
            width: 50%;
            text-align: center;
            vertical-align: top;
            padding-top: 80px;
            font-size: 12pt;
            padding-bottom: 10px;
        }

        .nama-penguji {
            font-weight: bold;
            text-decoration: underline;
            margin: 0;
        }

        .nip-penguji {
            margin: 0;
        }

        .footer-note {
            margin-top: 40px;
            margin-bottom: 50px;
            font-style: italic;
            font-size: 11pt;
        }

        /* Daftar Hadir Styles */
        .attendance-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
            font-size: 12pt;
        }

        .attendance-table th, .attendance-table td {
            border: 0.5pt solid black;
            padding: 10px;
            vertical-align: middle;
        }

        .attendance-table th {
            text-align: center;
            font-weight: bold;
        }

        .col-no-attendance { width: 8%; }
        .col-name-attendance { width: 62%; }
        .col-sign-attendance { width: 30%; }

        .sign-box {
            height: 50px;
        }
    </style>
</head>

<body>
    <div class="page page-first">
        <table class="header-table double-line">
            <tr>
                <td class="header-logo">
                    @php
                        $logoPath = \App\Models\AppSetting::get('header_logo') ?? \App\Models\AppSetting::get('qrcode_logo');
                        $logoSrc = $logoPath ? \Illuminate\Support\Facades\Storage::disk('public')->url($logoPath) : asset('images/logo-uin.png');
                    @endphp
                    <img src="{{ $logoSrc }}" alt="Logo UIN" onerror="this.style.display='none'">
                </td>
                <td class="header-text">
                    <p class="kop-1">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                    <p class="kop-2">UNIVERSITAS ISLAM NEGERI</p>
                    <p class="kop-2">SULTAN MAULANA HASANUDDIN BANTEN</p>
                    <p class="kop-3">FAKULTAS USHULUDDIN DAN ADAB</p>
                    <p class="kop-4">Jalan Syekh Nawawi Al Bantani Kp Andamui Sukawana Curug Kota Serang Banten
                        42171<br>
                        Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
                        Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u></p>
                </td>
            </tr>
        </table>

        <div class="title-section">
            <p class="title">S U R A T T U G A S</p>
            <p class="nomor">Nomor : {{ $nomor_surat ?? '${nomor_surat_generated}' }}</p>
        </div>

        <p class="main-paragraph">
            Dekan Fakultas Ushuluddin dan Adab Universitas Islam Negeri Sultan Maulana Hasanuddin Banten menugaskan
            kepada dosen-dosen yang tersebut namanya pada kolom 3 untuk duduk dalam <strong>Majelis Penguji
                Proposal</strong> terhadap mahasiswa-mahasiswa yang namanya tersebut pada kolom 2 dalam daftar di bawah
            ini. Ujian Proposal akan dilaksanakan pada hari {{ $hari_sidang ?? '${hari_sidang}' }} tanggal
            {{ $tanggal_sidang ?? '${tanggal_sidang}' }}, di Ruang Sidang Fakultas Ushuluddin dan Adab.
        </p>

        <table class="main-table">
            <thead>
                <tr>
                    <th class="col-no">NO</th>
                    <th class="col-mahasiswa">NAMA/NIM/JUR/SMT/<br>JUDUL PROPOSAL</th>
                    <th class="col-penguji">MAJELIS PENGUJI</th>
                    <th class="col-waktu">WAKTU</th>
                </tr>
                <tr class="sub-header">
                    <td>1</td>
                    <td>2</td>
                    <td>3</td>
                    <td>4</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="col-no">1</td>
                    <td class="col-mahasiswa">
                        {{ $nama_mahasiswa ?? '${nama_mahasiswa}' }}/{{ $nim ?? '${nim}' }}/{{ $kode_prodi ?? '${kode_prodi}' }}/{{ $semester_aktif ?? '${semester_aktif}' }}<br>
                        {{ $judul_disetujui ?? '' }}
                    </td>
                    <td class="col-penguji">
                        <table class="inner-table">
                            <tr>
                                <td class="penguji-label">Penguji I</td>
                                <td class="penguji-separator">:</td>
                                <td>{{ $penguji_1 ?? '${penguji_1}' }}</td>
                            </tr>
                            <tr>
                                <td class="penguji-label">Penguji II</td>
                                <td class="penguji-separator">:</td>
                                <td>{{ $penguji_2 ?? '${penguji_2}' }}</td>
                            </tr>
                        </table>
                    </td>
                    <td class="col-waktu">
                        {{ $waktu_sidang ?? '' }}
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="signature-section">
            <p class="signature-text" style="padding-left: 25px;">Serang, {{ $tanggal_surat ?? '${tanggal_surat}' }}</p>
            <p class="signature-text">a.n. Dekan</p>
            <p class="signature-text" style="padding-left: 25px;">Wakil Dekan Bidang Akademik</p>
            <div class="signature-space">
                {!! $ttd ?? '${ttd}' !!}
            </div>
            <p class="signature-text" style="font-weight: bold; padding-left: 25px;">
                {{ $nama_wakil_dekan ?? '${nama_pejabat}' }}</p>
            <p class="signature-text" style="padding-left: 25px;">NIP {{ $nip_wakil_dekan ?? '${nip_pejabat}' }}</p>
        </div>
        <div class="clear"></div>

        <div class="tembusan">
            <p class="tembusan-title"><em><strong>Tembusan disampaikan :</strong></em></p>
            <ol class="tembusan-list">
                <li>Dekan Fakultas Ushuluddin dan Adab sebagai Laporan;</li>
                <li>Wakil Dekan I, II dan III;</li>
                <li>Ketua Jurusan {{ $kode_prodi ?? 'IH' }};</li>
                <li>Mahasiswa yang bersangkutan.</li>
            </ol>
        </div>

        <div class="catatan">
            <p class="catatan-title"><em><strong>Catatan bagi Mahasiswa:</strong></em></p>
            <ul class="catatan-list">
                <li>Mahasiswa diwajibkan berpakaian dengan ketentuan:
                    <ul class="sub-catatan-list">
                        <li>Mahasiswa berpakaian putih, berdasi dan berjas almamater</li>
                        <li>Mahasiswi berpakaian muslimah dan berjas almamater</li>
                    </ul>
                </li>
                <li>Peserta ujian diwajibkan hadir 10 menit sebelum sidang dimulai</li>
                <li>Peserta ujian menyiapkan file presentasi</li>
                <li>Penguji yang tidak hadir akan digantikan oleh penguji yang lain</li>
            </ul>
        </div>

        <div class="footer">
            <table class="footer-table">
                <tr>
                    <td class="qrcode-cell">{!! $qrcode ?? '' !!}</td>
                    <td class="footer-text">
                        Dokumen ini diterbitkan secara elektronik melalui Sistem Informasi Layanan Akademik <br>
                        Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten.
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <div class="page">
        <table class="header-table double-line">
            <tr>
                <td class="header-logo">
                    @php
                        $logoPath = \App\Models\AppSetting::get('header_logo') ?? \App\Models\AppSetting::get('qrcode_logo');
                        $logoSrc = $logoPath ? \Illuminate\Support\Facades\Storage::disk('public')->url($logoPath) : asset('images/logo-uin.png');
                    @endphp
                    <img src="{{ $logoSrc }}" alt="Logo UIN" onerror="this.style.display='none'">
                </td>
                <td class="header-text">
                    <p class="kop-1">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                    <p class="kop-2">UNIVERSITAS ISLAM NEGERI</p>
                    <p class="kop-2">SULTAN MAULANA HASANUDDIN BANTEN</p>
                    <p class="kop-3">FAKULTAS USHULUDDIN DAN ADAB</p>
                    <p class="kop-4">Jalan Syekh Nawawi Al Bantani Kp Andamui Sukawana Curug Kota Serang Banten
                        42171<br>
                        Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
                        Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u></p>
                </td>
            </tr>
        </table>

        <div class="doc-title">
            BERITA ACARA DAN KEPUTUSAN<br>
            DISKUSI PROPOSAL SKRIPSI
        </div>

        <table class="data-table">
            <tr>
                <td>Nama Mahasiswa</td>
                <td>:</td>
                <td>{{ $nama_mahasiswa ?? '' }}</td>
            </tr>
            <tr>
                <td>NIM</td>
                <td>:</td>
                <td>{{ $nim ?? '' }}</td>
            </tr>
            <tr>
                <td>Tempat/Tanggal Lahir</td>
                <td>:</td>
                <td>{{ $tempat_lahir_mahasiswa ?? '' }}, {{ $tanggal_lahir_mahasiswa ?? '' }}</td>
            </tr>
            <tr>
                <td>Fakultas/Jurusan</td>
                <td>:</td>
                <td>Ushuluddin dan Adab/{{ $kode_prodi ?? 'IH' }}</td>
            </tr>
            <tr>
                <td>Semester</td>
                <td>:</td>
                <td>{{ $semester_aktif ?? '' }}</td>
            </tr>
            <tr>
                <td>Tahun Akademik</td>
                <td>:</td>
                <td>{{ $tahun_akademik ?? '2024/2025' }}</td>
            </tr>
        </table>

        <div class="decision-title">
            KEPUTUSAN DISKUSI PROPOSAL
        </div>

        <div class="paragraph">
            Setelah melihat dan mempertimbangkan hasil diskusi, maka dengan ini Majlis Diskusi
            Proposal Skripsi Fakultas Ushuluddin dan Adab Universitas Islam Negeri Sultan
            Maulana Hasanuddin Banten, memutuskan bahwa proposal skripsi dengan judul:
        </div>

        <div class="spacing-title"></div>

        <div class="paragraph">
            dinyatakan LAYAK/TIDAK LAYAK*) untuk diteruskan.
        </div>

        <div class="date-right">
            {{ $tanggal_sidang ?? '14 Mei 2025' }}
        </div>

        <div class="sign-title">
            MAJELIS PENGUJI
        </div>

        <div class="signature-grid">
            <div class="signature-row">
                <div class="signature-title">Penguji I,</div>
                <div class="signature-title">Penguji II,</div>
            </div>
            <div class="signature-row">
                <div class="signature-cell-2">
                    <p class="nama-penguji">{{ $penguji_1 ?? '{$penguji_1}' }}</p>
                    <!-- <p class="nip-penguji">NIP. {{ $nip_penguji_1 ?? '$nip_penguji_1' }}</p> -->
                </div>
                <div class="signature-cell-2">
                    <p class="nama-penguji">{{ $penguji_2 ?? '{$penguji_2}' }}</p>
                    <!-- <p class="nip-penguji">NIP. {{ $nip_penguji_2 ?? ' $nip_penguji_2' }}</p> -->
                </div>
            </div>
        </div>

        <div class="footer-note">
            *) Coret yang tidak perlu
        </div>

        <div class="footer">
            <table class="footer-table">
                <tr>
                    <td class="qrcode-cell">{!! $qrcode ?? '' !!}</td>
                    <td class="footer-text">
                        Dokumen ini diterbitkan secara elektronik melalui Sistem Informasi Layanan Akademik <br>
                        Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten.
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <div class="page">
        <table class="header-table double-line">
            <tr>
                <td class="header-logo">
                    @php
                        $logoPath = \App\Models\AppSetting::get('header_logo') ?? \App\Models\AppSetting::get('qrcode_logo');
                        $logoSrc = $logoPath ? \Illuminate\Support\Facades\Storage::disk('public')->url($logoPath) : asset('images/logo-uin.png');
                    @endphp
                    <img src="{{ $logoSrc }}" alt="Logo UIN" onerror="this.style.display='none'">
                </td>
                <td class="header-text">
                    <p class="kop-1">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                    <p class="kop-2">UNIVERSITAS ISLAM NEGERI</p>
                    <p class="kop-2">SULTAN MAULANA HASANUDDIN BANTEN</p>
                    <p class="kop-3">FAKULTAS USHULUDDIN DAN ADAB</p>
                    <p class="kop-4">Jalan Syekh Nawawi Al Bantani Kp Andamui Sukawana Curug Kota Serang Banten
                        42171<br>
                        Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
                        Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u></p>
                </td>
            </tr>
        </table>

        <div class="doc-title" style="margin-top: 35px;">
            DAFTAR HADIR DEWAN PENGUJI<br>
            PROPOSAL SKRIPSI
        </div>

        <table class="data-table">
            <tr>
                <td>Nama Mahasiswa</td>
                <td>:</td>
                <td>{{ $nama_mahasiswa ?? '' }}</td>
            </tr>
            <tr>
                <td>NIM</td>
                <td>:</td>
                <td>{{ $nim ?? '' }}</td>
            </tr>
            <tr>
                <td>Tempat/Tanggal Lahir</td>
                <td>:</td>
                <td>{{ $tempat_lahir_mahasiswa ?? '' }}, {{ $tanggal_lahir_mahasiswa ?? '' }}</td>
            </tr>
            <tr>
                <td>Fakultas/Jurusan</td>
                <td>:</td>
                <td>FUDA/{{ $kode_prodi ?? 'IH' }}</td>
            </tr>
            <tr>
                <td>Semester</td>
                <td>:</td>
                <td>{{ $semester_aktif ?? '' }}</td>
            </tr>
            <tr>
                <td>Tahun Akademik</td>
                <td>:</td>
                <td>{{ $tahun_akademik ?? '2024/2025' }}</td>
            </tr>
            <tr>
                <td>Tanggal Ujian</td>
                <td>:</td>
                <td>{{ $tanggal_sidang ?? '14 Mei 2025' }}</td>
            </tr>
        </table>

        <table class="attendance-table">
            <tr>
                <th class="col-no-attendance">NO</th>
                <th class="col-name-attendance">NAMA PENGUJI</th>
                <th class="col-sign-attendance">TANDA TANGAN</th>
            </tr>
            <tr>
                <td style="text-align: center;">1</td>
                <td>{{ $penguji_1 ?? '${penguji_1}' }}</td>
                <td><div class="sign-box"></div></td>
            </tr>
            <tr>
                <td style="text-align: center;">2</td>
                <td>{{ $penguji_2 ?? '${penguji_2}' }}</td>
                <td><div class="sign-box"></div></td>
            </tr>
        </table>

        <div class="footer">
            <table class="footer-table">
                <tr>
                    <td class="qrcode-cell">{!! $qrcode ?? '' !!}</td>
                    <td class="footer-text">
                        Dokumen ini diterbitkan secara elektronik melalui Sistem Informasi Layanan Akademik <br>
                        Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten.
                    </td>
                </tr>
            </table>
        </div>
    </div>

</body>

</html>