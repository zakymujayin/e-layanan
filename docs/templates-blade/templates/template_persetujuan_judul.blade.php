<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Persetujuan Judul Skripsi</title>
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
    padding: 20mm 25mm 25mm 25mm;
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
        padding: 25mm 25mm 25mm 25mm;
        width: 210mm;
        height: 297mm;
    }
}

/* Header Styles - Double Line Border */
.header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 5px;
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
    text-align: left;
    vertical-align: middle;
}

.header-logo img {
    width: clamp(80px, 10vw, 150px);
    height: auto;
    display: block;
    transform: translate(0px, -15px);
    max-width: 100%;
}

.header-text {
    text-align: center;
    transform: translate(-30px, 0px);
}

.kop-1 {
    font-size: 12pt;
    font-weight: bold;
    margin: 0;
    line-height: 1.2;
}

.kop-2 {
    font-size: 11pt;
    font-weight: bold;
    margin: 0;
    line-height: 1.2;
}

.kop-3 {
    font-size: 13pt;
    font-weight: bold;
    margin: 0;
    line-height: 1.2;
}

.kop-4 {
    font-size: 9pt;
    margin: 0;
    line-height: 1.3;
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
        .judul-surat {
            text-align: center;
            font-size: 12pt;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 1px;
            margin-top: 10px;
        }

        .nomor-surat {
            text-align: center;
            margin-bottom: 30px;
        }

        .tabel-biodata {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .tabel-biodata td {
            vertical-align: top;
            padding: 4px 8px;
            font-size: 12pt;
        }

        .tabel-biodata td:nth-child(1) { width: 180px; }
        .tabel-biodata td:nth-child(2) { width: 5px; text-align: center; padding: 4px 2px; }
        .tabel-biodata td:nth-child(3) { width: auto; }

        .paragraf-isi {
            text-align: justify;
            margin-bottom: 30px;
            font-size: 12pt;
            line-height: 1.5;
            text-indent: 1cm;
        }

        .judul-skripsi {
            margin: 40px 0 60px 0;
            text-align: center;
            font-weight: bold;
            font-size: 12pt;
            font-style: italic;
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

        <div class="judul-surat">
            SURAT PERSETUJUAN JUDUL SKRIPSI
        </div>
        <div class="nomor-surat">
            Nomor: {{ $nomor_surat ?? '' }}
        </div>

        <table class="tabel-biodata">
            <tr>
                <td colspan="3">Mahasiswa tersebut di bawah ini</td>
            </tr>
            <tr>
                <td style="padding-left: 40px;">Nama Mahasiswa</td>
                <td>:</td>
                <td>{{ $nama_mahasiswa ?? '' }}</td>
            </tr>
            <tr>
                <td style="padding-left: 40px;">NIM</td>
                <td>:</td>
                <td>{{ $nim ?? '' }}</td>
            </tr>
            <tr>
                <td style="padding-left: 40px;">Program Studi</td>
                <td>:</td>
                <td>{{ $kode_prodi ?? '' }}</td>
            </tr>
        </table>

        <div class="paragraf-isi">
            Telah memenuhi persyaratan untuk menyusun Skripsi (sesuai dengan Peraturan Pedoman Penyusunan Skripsi Universitas Islam Negeri Sultan Maulana Hasanuddin Banten) dalam semester {{ $semester_aktif ?? '' }} tahun akademik {{ $tahun_akademik ?? '' }} dengan judul sebagai berikut:
        </div>

        <div class="judul-skripsi">
            "{{ $judul_disetujui ?? '' }}"
        </div>

        <div class="paragraf-isi">
            Demikian surat persetujuan judul skripsi ini dibuat untuk dipergunakan sebagaimana mestinya.
        </div>

        <div class="signature-section">
            <p class="signature-text" style="padding-left: 25px;">Serang, {{ $tanggal_surat ?? '' }}</p>
            <p class="signature-text">a.n. Dekan</p>
            <p class="signature-text" style="padding-left: 25px;">Wakil Dekan Bidang Akademik</p>
            <div class="signature-space">
                {!! $ttd ?? '' !!}
            </div>
            <p class="signature-text" style="font-weight: bold; text-decoration: underline; padding-left: 25px;">
                {{ $nama_wakil_dekan ?? '' }}</p>
            <p class="signature-text" style="padding-left: 25px;">NIP. {{ $nip_wakil_dekan ?? '' }}</p>
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
