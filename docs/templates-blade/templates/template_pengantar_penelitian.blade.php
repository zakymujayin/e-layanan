<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Pengantar Penelitian</title>
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
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.1;
    color: #000;
    margin: 0;
    padding: 0;
    background-color: #525252;
}

.page {
    width: 210mm;
    height: 297mm;
    background: white;
    padding: 15mm 25mm 25mm 25mm;
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

@media print {
    body {
        background: none;
    }
    .page {
        margin: 0;
        box-shadow: none !important;
        padding: 15mm 25mm 25mm 25mm;
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
    padding: 10px 20mm;
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
    font-size: 8.5pt;
    color: #555;
}

.qrcode-cell {
    width: 15mm;
    text-align: left;
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

/* Custom styles for this template */
.info-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.info-table td {
    border: none;
    padding: 2px 0;
    vertical-align: top;
}

.kepada-section {
    margin-left: 80px;
    margin-bottom: 25px;
    line-height: 1.3;
}

.main-paragraph {
    text-align: justify;
    margin-top: 5px;
    margin-bottom: 15px;
    line-height: 1.4;
}

.student-info-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.student-info-table td {
    border: none;
    padding: 1px 0;
    vertical-align: top;
    line-height: 1.2;
}

.student-info-label {
    width: 130px;
}

.student-info-sep {
    width: 15px;
    text-align: center;
}

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
    </style>
</head>

<body>
    <div class="page">
        <!-- Header -->
        <table class="header-table double-line">
            <tr>
                <td class="header-logo">
                    @php
                        $logoPath = \App\Models\AppSetting::get('header_logo') ?? \App\Models\AppSetting::get('qrcode_logo');
                        $logoSrc = $logoPath ? \Illuminate\Support\Facades\Storage::disk('public')->url($logoPath) : asset('images/logo_uin.png');
                    @endphp
                    <img src="{{ $logoSrc }}" alt="Logo UIN" onerror="this.style.display='none'">
                </td>
                <td class="header-text">
                    <p class="kop-1">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                    <p class="kop-2">UNIVERSITAS ISLAM NEGERI</p>
                    <p class="kop-2">SULTAN MAULANA HASANUDDIN BANTEN</p>
                    <p class="kop-3">FAKULTAS USHULUDDIN DAN ADAB</p>
                    <p class="kop-4">Jalan Syekh Nawawi Al Bantani Kp Andamui Sukawana Curug Kota Serang Banten 42171<br>
                        Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
                        Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u></p>
                </td>
            </tr>
        </table>

        <!-- Info Surat -->
        <table class="info-table">
            <tr>
                <td style="width: 70px;">Nomor</td>
                <td style="width: 10px;">:</td>
                <td>{{ $nomor_surat ?? '040/Un.17/F.III/PP.00.9/01/2026' }}</td>
            </tr>
            <tr>
                <td>Lampiran</td>
                <td>:</td>
                <td>-</td>
            </tr>
            <tr>
                <td>Hal</td>
                <td>:</td>
                <td>Izin Penelitian</td>
            </tr>
        </table>

        <!-- Kepada Yth -->
        <div class="kepada-section">
            Kepada Yth.<br>
            {!! $pejabat_tujuan ?? '<strong>1. Kepala Desa Cimaung Kecamatan Cikeusal</strong><br><strong>2. Kepala Desa Kaungcaang Kecamatan Cadasari</strong>' !!}<br>
            di-<br>
            &nbsp;&nbsp;&nbsp;&nbsp;Tempat
        </div>

        <p class="main-paragraph">
            Dengan Hormat,<br>
            Dekan Fakultas Ushuluddin dan Adab Universtas Islam Negeri Sultan Maulana Hasanuddin Banten dengan ini memohon kepada Bapak/Ibu untuk dapat kiranya menerima Mahasiswa/i berikut ini :
        </p>

        <!-- Student Info -->
        <table class="student-info-table">
            <tr>
                <td class="student-info-label">Nama</td>
                <td class="student-info-sep">:</td>
                <td><strong>{{ $nama_mahasiswa ?? 'AISYAH PURWATI' }}</strong></td>
            </tr>
            <tr>
                <td class="student-info-label">NIM</td>
                <td class="student-info-sep">:</td>
                <td>{{ $nim ?? '221360023' }}</td>
            </tr>
            <tr>
                <td class="student-info-label">Tempat/Tgl.Lahir</td>
                <td class="student-info-sep">:</td>
                <td>{{ $tempat_lahir ?? 'Serang' }}, {{ $tanggal_lahir ?? '30 November 2003' }}</td>
            </tr>
            <tr>
                <td class="student-info-label">Fakultas</td>
                <td class="student-info-sep">:</td>
                <td>{{ $fakultas ?? 'Ushuluddin dan Adab' }}</td>
            </tr>
            <tr>
                <td class="student-info-label">Jurusan/Semester</td>
                <td class="student-info-sep">:</td>
                <td>{{ $nama_prodi ?? 'Bahasa dan Sastra Arab' }}/ {{ $semester_teks ?? 'VII (Tujuh)' }}</td>
            </tr>
            <tr>
                <td class="student-info-label">Judul Skripsi</td>
                <td class="student-info-sep">:</td>
                <td style="text-align: justify;"><strong>{{ $judul_skripsi ?? 'Pengaruh Bahasa Ibu Terhadap Pelafalan Fonem Dalam Bahasa Arab Oleh Penutur Indonesia' }}</strong></td>
            </tr>
            <tr>
                <td class="student-info-label">Tempat Penelitian</td>
                <td class="student-info-sep">:</td>
                <td>{!! $tempat_penelitian ?? '<strong>1. Kp. Pabuaran, Desa Cimaung, Kecamatan Cikeusal</strong><br><strong>2. Kp. Kaungcaang, Desa Kaungcaang, Kecamatan Cadasari</strong>' !!}</td>
            </tr>
        </table>

        <p class="main-paragraph">
            Akan melaksanakan wawancara kepada Bapak/Ibu untuk kepentingan Penelitian Skripsi dengan judul sebagaimana tersebut diatas. Pelaksanaan Penelitian disesuaikan dengan jadwal yang ditentukan oleh Bapak/Ibu.
        </p>

        <p class="main-paragraph">
            Demikian Permohonan ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terimakasih.
        </p>

        <table style="width: 100%; border: none; margin-top: 20px;">
            <tr>
                <td style="width: 55%; border: none;"></td>
                <td style="width: 45%; border: none; text-align: center; line-height: 1.2;">
                    <p class="signature-text" style="margin-bottom: 5px;">Serang, {{ $tanggal_surat ?? '13 Januari 2026' }}</p>
                    <p class="signature-text">a.n. Dekan Fakultas Ushuluddin dan Adab</p>
                    <p class="signature-text">Wakil Dekan Bidang Akademik</p>
                    <p class="signature-text">dan Kelembagaan,</p>

                    <div style="min-height: 70px; display: flex; align-items: center; justify-content: center;">
                        {!! $ttd ?? '' !!}
                    </div>

                    <p class="signature-text" style="font-weight: bold; text-decoration: underline;">{{ $nama_wakil_dekan ?? 'Masrukhin Muhsin' }}</p>
                    <p class="signature-text">NIP. {{ $nip_wakil_dekan ?? '${nip_wakil_dekan}' }}</p>
                </td>
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
