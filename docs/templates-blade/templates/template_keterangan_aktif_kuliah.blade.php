<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Keterangan Masih Kuliah</title>
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
    text-align: left;
    position: relative;
}

.header-logo img {
    width: clamp(80px, 10vw, 150px);
    height: auto;
    position: absolute;
    margin-left: 20px;
    margin-top: -70px;
    max-width: 100%;
}

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
        /* Title */
        .title-section {
            text-align: center;
            margin-bottom: 20px;
            line-height: 1.2;
        }

        .title {
            font-size: 12pt;
            font-weight: bold;
            text-decoration: underline;
            margin: 0;
        }

        .nomor {
            font-size: 11pt;
            margin: 0;
        }

        /* Content */
        .main-paragraph {
            text-align: justify;
            margin-top: 15px;
            margin-bottom: 15px;
            line-height: 1.5;
        }

        /* Form Tables */
        table.form-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            margin-left: 40px;
        }

        table.form-table td {
            border: none;
            padding: 3px 0;
            vertical-align: top;
        }

        .form-label {
            width: 150px;
        }

        .form-sep {
            width: 15px;
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
        
        <div class="title-section">
            <p class="title">SURAT KETERANGAN MASIH KULIAH</p>
            <p class="nomor">NOMOR:{{ $nomor_surat ?? '{nomor_surat}' }}</p>
        </div>

        <p class="main-paragraph" style="margin-bottom: 5px;">Yang bertanda tangan di bawah ini,</p>

        <table class="form-table">
            <tr><td class="form-label">Nama</td><td class="form-sep">:</td><td>{{ $nama_wakil_dekan ?? '{nama_wakil_dekan}' }}</td></tr>
            <tr><td>NIP</td><td>:</td><td>{{ $nip_wakil_dekan ?? '{nip_wakil_dekan}' }}</td></tr>
            <tr><td>Pangkat/golongan</td><td>:</td><td>{{ $pangkat_pejabat ?? 'Pembina Utama Muda / IVc' }}</td></tr>
            <tr><td>Jabatan</td><td>:</td><td>{{ $jabatan_pejabat ?? 'Wakil Dekan I' }}</td></tr>
        </table>

        <p class="main-paragraph" style="margin-bottom: 5px; margin-top: 5px;">Dengan ini menerangkan dengan sesungguhnya bahwa nama dibawah :</p>

        <table class="form-table">
            <tr><td class="form-label">Nama</td><td class="form-sep">:</td><td>{{ $nama_mahasiswa ?? '{nama_mahasiswa}' }}</td></tr>
            <tr><td>Tempat/Tgl. Lahir</td><td>:</td><td>{{ $tempat_lahir_mahasiswa ?? '{tempat_lahir_mahasiswa}' }}, {{ $tanggal_lahir_mahasiswa ?? '{tanggal_lahir_mahasiswa}' }}</td></tr>
            <tr><td>NIM</td><td>:</td><td>{{ $nim ?? '{nim}' }}</td></tr>
            <tr><td>Fakultas</td><td>:</td><td>Ushuluddin dan Adab</td></tr>
            <tr><td>Prodi/Semester</td><td>:</td><td>{{ $nama_prodi ?? '{nama_prodi}' }} / {{ $semester_teks ?? '{semester_teks}' }}</td></tr>
        </table>

        <p class="main-paragraph">
            Adalah Mahasiswa Fakultas Ushuluddin dan Adab Universitas Islam Negeri Sultan Maulana Hasanuddin Banten yang masih <strong>aktif kuliah</strong> pada <strong>semester {{ $semester_teks ?? '{semester_teks}' }} tahun akademik {{ $tahun_akademik ?? '{tahun_akademik}' }}.</strong>
        </p>

        <p class="main-paragraph">
            Surat keterangan ini dibuat untuk Persyaratan {{ $peruntukan_surat ?? '{$peruntukan_surat}' }}.
        </p>

        <p class="main-paragraph">
            Demikianlah surat keterangan ini dibuat dengan sebenarnya, untuk dipergunakan dengan sebaiknya.
        </p>

        <div class="signature-section">
            <p class="signature-text" style="padding-left: 25px;">Serang, {{ $tanggal_surat ?? '{tanggal_surat}' }}</p>
            <p class="signature-text">a.n. Dekan</p>
            <p class="signature-text" style="padding-left: 25px;">Wakil Dekan Bidang Akademik dan</p>
            <p class="signature-text" style="padding-left: 25px;">Kelembagaan</p>

            <div class="signature-space">
                {!! $ttd ?? '' !!}
            </div>

            <p class="signature-text" style="font-weight: bold; text-decoration: underline; padding-left: 25px;">{{ $nama_wakil_dekan ?? '{nama_wakil_dekan}' }}</p>
            <p class="signature-text" style="padding-left: 25px;">NIP. {{ $nip_wakil_dekan ?? '{nip_wakil_dekan}' }}</p>
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
