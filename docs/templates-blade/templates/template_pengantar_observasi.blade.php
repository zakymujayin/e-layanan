<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Surat Pengantar Observasi</title>
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
    margin-bottom: 25px;
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
                <td>{{ $nomor_surat ?? '046/Un.17/F.III/PP.00.9/01/2026' }}</td>
            </tr>
            <tr>
                <td>Lampiran</td>
                <td>:</td>
                <td>-</td>
            </tr>
            <tr>
                <td>Hal</td>
                <td>:</td>
                <td><strong><em>Surat Pengantar Observasi</em></strong></td>
            </tr>
        </table>

        <!-- Kepada Yth -->
        <div class="kepada-section">
            Kepada Yth;<br>
            <strong>{{ $pejabat_tujuan ?? 'Kepala Dinas Perpustakaan dan Kearsipan Provinsi Banten' }}</strong><br>
            @if(isset($instansi_tujuan) && $instansi_tujuan)
            <strong>{{ $instansi_tujuan }}</strong><br>
            @endif
            di_<br>
            &nbsp;&nbsp;&nbsp;&nbsp;Tempat
        </div>

        <p style="margin-bottom: 5px;"><strong><em>Assalamu'alaikum Wr.Wb.</em></strong></p>

        <p class="main-paragraph">
            Dengan hormat,<br>
            Dalam rangka memenuhi tugas <strong><em>Observasi {{ $mata_kuliah ?? 'Mata Kuliah Seminar Proposal' }}</em></strong> Program Studi {{ $nama_prodi ?? 'Perpustakaan dan Informasi Islam (IPII)' }} Fakultas Ushuluddin dan Adab, maka dengan ini kami memohon kepada Bapak/Ibu berkenan memberikan izin mahasiswa yang namanya tercantum di bawah ini untuk melakukan <strong><em>Observasi dan Penelitian</em></strong>@if(isset($lokasi_observasi) && !empty($lokasi_observasi)) di <strong>{{ is_array($lokasi_observasi) ? implode(', ', array_column($lokasi_observasi, 'lokasi')) : $lokasi_observasi }}</strong>@endif. Adapun nama mahasiswa yang dimaksud yaitu:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px;" border="1">
            <thead>
                <tr style="background-color: #e0e0e0;">
                    <th style="padding: 10px; text-align: center; font-weight: bold;">No</th>
                    <th style="padding: 10px; text-align: center; font-weight: bold;">Nama</th>
                    <th style="padding: 10px; text-align: center; font-weight: bold;">NIM</th>
                    <th style="padding: 10px; text-align: center; font-weight: bold;">Prodi</th>
                    <th style="padding: 10px; text-align: center; font-weight: bold;">Semester</th>
                    <th style="padding: 10px; text-align: center; font-weight: bold;">Dosen</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 8px; text-align: center;">1.</td>
                    <td style="padding: 8px; text-align: center;">{{ $nama_mahasiswa ?? 'Vira Khoirunisa' }}</td>
                    <td style="padding: 8px; text-align: center;">{{ $nim ?? '221390006' }}</td>
                    <td style="padding: 8px; text-align: center;">{{ $kode_prodi ?? 'IPII' }}</td>
                    <td style="padding: 8px; text-align: center;">{{ $semester_teks ?? 'VII (Tujuh)' }}</td>
                    <td style="padding: 8px; text-align: center; font-weight: bold;">{{ $dosen_pembimbing ?? 'Dr. H. Endang Saeful Anwar, Lc, M.A.' }}</td>
                </tr>
            </tbody>
        </table>

        <p class="main-paragraph">
            Demikian atas perhatian dan kerjasamanya diucapkan terima kasih.
        </p>

        <p style="margin-bottom: 30px;"><strong><em>Wassalamu'alaikum Wr.Wb.</em></strong></p>

        <table style="width: 100%; border: none;">
            <tr>
                <td style="width: 55%; border: none;"></td>
                <td style="width: 45%; border: none; text-align: left; line-height: 1.2;">
                    <p class="signature-text" style="margin-bottom: 5px;">Serang, {{ $tanggal_surat ?? '14 Januari 2026' }}</p>
                    <p class="signature-text">a.n. Dekan</p>
                    <div style="padding-left: 20px;">
                        <p class="signature-text">Wakil Dekan Bidang Akademik</p>
                        <p class="signature-text">dan Kelembagaan</p>
                    </div>

                    <div style="min-height: 70px; padding-left: 20px; display: flex; align-items: center;">
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
