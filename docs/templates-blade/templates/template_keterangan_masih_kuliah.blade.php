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
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12pt;
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
        padding: 20mm 25mm 25mm 25mm;
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

        /* ================= HEADER KOP SURAT ================= */
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
            padding-bottom: 5px;
        }
        .kop-1 { font-size: 13pt; font-weight: bold; margin: 0; font-family: Arial, Helvetica, sans-serif !important; }
        .kop-2 { font-size: 12pt; font-weight: bold; margin: 0; font-family: Arial, Helvetica, sans-serif !important; }
        .kop-3 { font-size: 14pt; font-weight: bold; margin: 0; font-family: Arial, Helvetica, sans-serif !important; }
        .kop-4 { font-size: 9pt; margin: 0; margin-bottom: 2px; font-family: Arial, Helvetica, sans-serif !important; }

        /* ================= FOOTER ================= */
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
        body {
            font-size: 10pt;
        }

        .title-section {
            text-align: center;
            margin-bottom: 20px;
            line-height: 1.2;
        }

        .title-text {
            margin: 0;
        }

        .content-section {
            margin-bottom: 20px;
            text-align: justify;
        }

        table.info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        table.info-table td {
            border: none;
            padding: 3px 0;
            vertical-align: top;
        }

        .info-label {
            width: 120px;
        }

        .info-sep {
            width: 15px;
            text-align: center;
        }

        .closing {
            text-align: justify;
            margin-bottom: 20px;
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
        
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .underline { text-decoration: underline; }
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
        
        <div class="title-section" style="margin-top: 10px; margin-bottom: 20px;">
            <p class="title-text bold underline" style="font-size: 11pt;">SURAT KETERANGAN MASIH KULIAH</p>
            <p class="title-text">NOMOR: {{ $nomor_surat ?? '{nomor_surat}' }}</p>
        </div>

        <p class="content-section" style="margin-bottom: 15px;">
            Yang bertanda tangan di bawah ini,
        </p>

        <table class="info-table" style="margin-left: 35px; margin-bottom: 15px;">
            <tr>
                <td style="width: 140px;">Nama</td>
                <td style="width: 15px;">:</td>
                <td>{{ $nama_wakil_dekan ?? '{$nama_wakil_dekan}' }}</td>
            </tr>
            <tr>
                <td>NIP</td>
                <td>:</td>
                <td>{{ $nip_wakil_dekan ?? '{$nip_wakil_dekan}' }}</td>
            </tr>
            <tr>
                <td>Pangkat/golongan</td>
                <td>:</td>
                <td>{{ $pangkat_pejabat ?? 'Pembina Utama Muda/IVc' }}</td>
            </tr>
            <tr>
                <td>Jabatan</td>
                <td>:</td>
                <td>Wakil Dekan I</td>
            </tr>
        </table>

        <p class="content-section" style="margin-bottom: 10px;">
            Dengan ini menerangkan dengan sesungguhnya bahwa nama dibawah :
        </p>

        <table class="info-table" style="margin-left: 35px; margin-bottom: 10px;">
            <tr>
                <td style="width: 140px;">Nama</td>
                <td style="width: 15px;">:</td>
                <td>{{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}</td>
            </tr>
            <tr>
                <td>Tempat/Tgl. Lahir</td>
                <td>:</td>
                <td>{{ $tempat_lahir_mahasiswa ?? '{$tempat_lahir}' }}, {{ $tanggal_lahir_mahasiswa ?? '{$tanggal_lahir}' }}</td>
            </tr>
            <tr>
                <td>NIM</td>
                <td>:</td>
                <td>{{ $nim ?? '{$nim}' }}</td>
            </tr>
            <tr>
                <td>Fakultas</td>
                <td>:</td>
                <td>Ushuluddin dan Adab</td>
            </tr>
            <tr>
                <td>Prodi/Semester</td>
                <td>:</td>
                <td>{{ $nama_prodi ?? '{$nama_prodi}' }} / {{ $semester_teks ?? '{$semester_teks}' }}</td>
            </tr>
        </table>

        @if(isset($is_ortu_pns) && $is_ortu_pns)
        <table class="info-table" style="margin-bottom: 10px;">
            <tr>
                <td style="width: 175px;">Data Orang Tua</td>
                <td style="width: 15px;">:</td>
                <td></td>
            </tr>
            <tr>
                <td style="padding-left: 35px;">Nama</td>
                <td>:</td>
                <td>{{ $nama_ortu ?? '{$nama_ortu}' }}</td>
            </tr>
            <tr>
                <td style="padding-left: 35px;">NIP</td>
                <td>:</td>
                <td>{{ $nip_ortu ?? '{$nip_ortu}' }}</td>
            </tr>
            <tr>
                <td style="padding-left: 35px;">Pangkat/golongan</td>
                <td>:</td>
                <td>{{ $pangkat_ortu ?? '{$pangkat_ortu}' }}</td>
            </tr>
            <tr>
                <td style="padding-left: 35px;">Instansi</td>
                <td>:</td>
                <td>{!! nl2br(e($instansi_ortu ?? '{$instansi_ortu}')) !!}</td>
            </tr>
        </table>
        @endif

        <p class="content-section" style="margin-bottom: 15px;">
            Adalah Mahasiswa Fakultas Ushuluddin dan Adab Universitas Islam Negeri Sultan Maulana Hasanuddin Banten yang masih <span class="bold">aktif kuliah</span> pada <span class="bold">semester {{ $jenis_semester ?? 'genap' }} tahun akademik {{ $tahun_akademik ?? '2025/2026' }}</span>.
        </p>

        <p class="content-section" style="margin-bottom: 15px;">
            Surat keterangan ini dibuat untuk keperluan {{ $peruntukan ?? $keperluan ?? '{$peruntukan}' }}.
        </p>

        <p class="content-section" style="margin-bottom: 30px;">
            Demikianlah surat keterangan ini dibuat dengan sebenarnya, untuk dipergunakan dengan sebaiknya.
        </p>

        <table style="width: 100%; border: none;">
            <tr>
                <td style="width: 60%; border: none;"></td>
                <td style="width: 40%; border: none; text-align: left; line-height: 1.2;">
                    Serang, {{ $tanggal_surat ?? '{$tanggal_surat}' }}<br>
                    a.n. Dekan<br>
                    <div style="padding-left: 20px;">Wakil Dekan Bidang Akademik</div>
                    <div style="padding-left: 20px;">dan Kelembagaan</div>
                    <div style="min-height: 70px; margin-left: 20px; display: flex; align-items: center;">
                        {!! $ttd ?? '' !!}
                    </div>
                    <div class="bold" style="text-decoration: underline;">{{ $nama_wakil_dekan ?? 'Masrukhin Muhsin' }}</div>
                    <div>NIP. {{ $nip_wakil_dekan ?? '197202021999031004' }}</div>
                </td>
            </tr>
        </table>

        <div style="margin-top: 30px; font-size: 9pt; margin-bottom: 50px;" class="bold italic">
            CATATAN : UNTUK MAHASISWA YANG ORANG TUANYA BUKAN PNS, DATA ORANG TUANYA TIDAK DITAMPILKAN
        </div>

        <!-- FOOTER KHUSUS PAGE 1 -->
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
