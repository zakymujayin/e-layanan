<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Surat Permohonan Magang</title>
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
    width: 50%;
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
        /* Info Surat */
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

        /* Kepada Yth */
        .kepada-section {
            margin-left: 100px;
            margin-bottom: 30px;
            line-height: 1.3;
        }

        /* Content */
        .main-paragraph {
            text-align: justify;
            margin-top: 15px;
            margin-bottom: 15px;
            line-height: 1.5;
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
    </style>
</head>

<body>
    <div class="page">
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
                <td>{{ $nomor_surat ?? '011/Un.17/F.III/PP.00.9/01/2026' }}</td>
                <td style="text-align: right;">Serang, {{ $tanggal_surat ?? '07 Januari 2026' }}</td>
            </tr>
            <tr>
                <td>Lampiran</td>
                <td>:</td>
                <td colspan="2">-</td>
            </tr>
            <tr>
                <td>Perihal</td>
                <td>:</td>
                <td colspan="2"><strong><em>Permohonan Magang</em></strong></td>
            </tr>
        </table>

        <!-- Kepada Yth -->
        <div class="kepada-section">
            Kepada Yth.<br>
            <strong>{{ $pejabat_tujuan ?? 'Kepala Dinas Perpustakaan dan Kearsipan Provinsi Banten' }}</strong><br>
            di-<br>
            &nbsp;&nbsp;&nbsp;&nbsp;Tempat
        </div>

        <p><strong><em>Assalamualaikum, Wr. Wb.</em></strong></p>

        <p class="main-paragraph">
            Dalam rangka memenuhi kewajiban kurikulum dan demi peningkatan keterampilan mahasiswa, Program Studi {{ $nama_prodi ?? 'Perpustakaan dan Informasi Islam (IPII)' }} Fakultas Ushuluddin dan Adab, maka dengan ini kami memohon kepada Bapak/Ibu berkenan memberikan izin mahasiswa yang namanya tercantum di bawah ini untuk melakukan <em>magang</em> di instansi/kantor yang bapak/Ibu pimpin.
        </p>

        <p class="main-paragraph">
            Berikut ini kami sampaikan Mahasiswa yang akan melaksanakan kegiatan tersebut :
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;" border="1">
            <thead>
                <tr>
                    <th style="padding: 8px; text-align: center; font-weight: bold;">NO.</th>
                    <th style="padding: 8px; text-align: center; font-weight: bold;">NAMA MAHASISWA</th>
                    <th style="padding: 8px; text-align: center; font-weight: bold;">NIM</th>
                    <th style="padding: 8px; text-align: center; font-weight: bold;">PRODI/<br>SEMESTER</th>
                    <th style="padding: 8px; text-align: center; font-weight: bold;">DOSEN<br>PEMBIMBING</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 8px; text-align: center;">1.</td>
                    <td style="padding: 8px; text-align: center;"><strong>{{ $nama_mahasiswa ?? 'MILA SYAHROZA' }}</strong></td>
                    <td style="padding: 8px; text-align: center;">{{ $nim ?? '241390012' }}</td>
                    <td style="padding: 8px; text-align: center;">{{ $kode_prodi ?? 'IPII' }}/{{ $semester_aktif ?? '3' }}</td>
                    <td style="padding: 8px; text-align: center;">{{ $dosen_pembimbing ?? 'Verry Mardiyanto, M.A' }}</td>
                </tr>
            </tbody>
        </table>

        <p class="main-paragraph">
            Adapun kegiatan yang dimaksud akan dilaksanakan dari <strong><em>tanggal {{ $waktu_pelaksanaan ?? '12 Januari 2026 s.d 06 Februari 2026' }}</em></strong>.
        </p>

        <p class="main-paragraph">
            Demikian Surat Permohonan ini kami buat, atas perhatian dan kerjasamanya diucapkan terima kasih.
        </p>

        <p style="margin-bottom: 30px;"><strong><em>Wassalamualaikum, Wr. Wb.</em></strong></p>

        <div class="signature-section" style="margin-top: 10px;">
            <p class="signature-text">Dekan</p>
            <p class="signature-text">Fakultas Ushuluddin dan Adab,</p>

            <div class="signature-space" style="min-height: 80px;">
                {!! $ttd ?? '' !!}
            </div>

            <p class="signature-text">{{ $nama_dekan ?? 'Masykur' }}</p>
        </div>
        <div class="clear"></div>

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
