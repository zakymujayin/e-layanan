<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Tugas Ujian Komprehensif</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        body {
            background-color: #525252;
            font-family: 'Bookman Old Style', "Times New Roman", Times, serif;
            font-size: 11pt;
            line-height: 1.0;
            color: #000;
        }

        .page {
            background: white;
            width: 210mm;
            min-height: 297mm;
            padding: 10mm 20mm 15mm 20mm;
            margin: 10mm auto;
            box-sizing: border-box;
            box-shadow: 0 4px 8px rgba(0,0,0,0.5);
            position: relative;
            page-break-after: always;
            display: block;
        }

        .page:last-of-type {
            page-break-after: auto;
        }

        @media print {
            @page { 
                size: A4 portrait; 
                margin: 0; 
            }
            
            body { 
                background-color: white; 
                padding: 0; 
                margin: 0; 
            }
            
            html { margin: 0; padding: 0; }
            
            .page { 
                margin: 0; 
                padding: 10mm 15mm 10mm 15mm;
                box-shadow: none; 
                page-break-after: always; 
                page-break-inside: auto;
                width: 210mm; 
                height: 297mm !important; /* MENGUNCI FOOTER AGAR TETAP DI BAWAH */
                box-sizing: border-box; 
                display: block;
                position: relative;
            }
            
            .page:last-of-type { 
                page-break-after: auto;
            }
        }

        /* Page 1 specific styling - Arial font */
        .page-first {
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 10pt !important;
            line-height: 1.2 !important;
            padding: 10mm 15mm 15mm 15mm !important;
        }
        .page-first .justify {
            line-height: 1.2 !important;
        }

        @media print {
            .page.page-first {
                padding: 10mm 15mm 15mm 15mm !important;
            }
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
            padding: 10px 25mm;
            border-top: 1px solid #ddd;
            background: white;
        }
        table.footer-table {
            width: 100%;
            border-collapse: collapse;
        }
        table.footer-table td {
            border: none;
            padding: 5px;
            vertical-align: middle;
            font-size: 9pt;
            font-family: Arial, Helvetica, sans-serif !important;
        }
        .qrcode-cell {
            width: 18mm;
            text-align: center;
        }
        .qrcode-cell img {
            width: 15mm;
            height: 15mm;
            display: block;
        }
        .footer-text {
            text-align: left;
            line-height: 1.2;
            padding-left: 10px;
        }

        /* ================= TYPOGRAPHY & LAYOUT ================= */
        .doc-title { text-align: center; font-size: 12pt; font-weight: bold; margin-bottom: 15px; margin-top: 15px; }
        .justify { text-align: justify; line-height: 1.0;}
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .underline { text-decoration: underline; }
        .form-code { text-align: right; font-style: italic; font-weight: bold; font-size: 11pt; margin-top: 2px; margin-bottom: 2px;}

        /* ================= TABEL BIODATA ================= */
        .bio-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; font-size: 11pt; }
        .bio-table td { vertical-align: top; padding: 1px 0; line-height: 1.0; border: none; }
        .bio-label { width: 200px; }
        .bio-colon { width: 15px; text-align: center; }
        
        /* ================= TABEL UTAMA SURAT TUGAS ================= */
        .tabel-tugas { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; font-size: 10pt; }
        .tabel-tugas th, .tabel-tugas td { border: 1px solid black; padding: 5px; vertical-align: middle; }
        .tabel-tugas th { background-color: #d9d9d9; text-align: center; font-weight: bold; }

        /* ================= TABEL KETERANGAN NILAI ================= */
        .tabel-taksiran { width: 60%; border-collapse: collapse; font-size: 9pt; text-align: center; font-family: 'Bookman Old Style', serif; margin-top: 5px; } /* page-break-inside: avoid dihapus */
        .tabel-taksiran th, .tabel-taksiran td { border: 1px solid black; padding: 0px 2px; } /* Padding dikompres */
        .tabel-taksiran th { font-weight: bold; }

        /* ================= CATATAN PAGE 1 ================= */
        .catatan-table { width: 100%; font-size: 8pt; border-collapse: collapse; margin-top: 15px;}
        .catatan-table td { vertical-align: top; padding: 1px; border: none; }
        
        .catatan-mhs { font-size: 8pt; margin-top: 10px; }
        .catatan-mhs-list { margin-left: 20px; }
        .catatan-mhs-list ol { margin: 0; padding-left: 15px; }
        .catatan-mhs-list ol li { margin-bottom: 2px; }
        .catatan-mhs-list ol li ol { padding-left: 15px; list-style-type: lower-alpha; }

        /* ================= RUMUS ================= */
        .rumus { margin-left: 215px; line-height: 1.5; margin-bottom: 15px; }
        .rumus-frac { display: inline-block; text-align: center; vertical-align: middle; }
        .rumus-num { border-bottom: 1px solid black; display: block; padding: 0 5px; }
        .rumus-den { display: block; padding: 0 5px; }
    </style>
</head>
<body>

    <div class="page page-first">
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
                    <p class="kop-4">Jalan Syekh Nawawi Kp. Andamui Kel. Sukawana Kec. Curug Kota Serang Banten 42171<br>
                        Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
                        Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u></p>
                </td>
            </tr>
        </table>

        <div class="center" style="margin-bottom: 12px;">
            <div style="font-size: 14pt; font-weight: bold; letter-spacing: 2px;">
                <span class="underline">SURAT TUGAS</span>
            </div>
            <div style="font-size: 10pt; margin-top: 1px; font-weight: bold;">Nomor : {{ $nomor_surat ?? '455/Un.17/F.III.1/KP.01.2/04/2018' }}</div>
        </div>

        <div class="justify" style="margin-bottom: 10px;">
            Dekan Fakultas Ushuluddin dan Adab Universitas Islam Negeri Sultan Maulana Hasanuddin Banten menugaskan dosen-dosen yang tersebut namanya di bawah ini untuk melaksanakan <span class="bold">Ujian Komprehensif</span> terhadap mahasiswa tersebut dalam daftar ini yang akan dilaksanakan pada hari <span class="bold">{{ $hari_sidang ?? '{$hari_sidang}' }}</span> tanggal <span class="bold">{{ $tanggal_sidang ?? '{$tanggal_sidang}' }}</span> di ruang Sidang Kampus II Fakultas Ushuluddin dan Adab.
        </div>

        <div style="text-align: right; font-size: 9pt; font-weight: bold; margin-bottom: 2px;">{{ $ruang_sidang ?? '{$ruang_sidang}' }}</div>
        <table class="tabel-tugas">
            <thead>
                <tr>
                    <th style="width: 5%;">NO</th>
                    <th style="width: 25%;">NAMA / NIM / JURUSAN</th>
                    <th style="width: 55%;">DEWAN PENGUJI</th>
                    <th style="width: 15%;">WAKTU /<br>RUANG</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="center">1</td>
                    <td style="padding-left: 10px;">
                        {{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}/<br>
                        {{ $nim ?? '{$nim}' }}/{{ $kode_prodi ?? '{$kode_prodi}' }}/{{ $semester_aktif ?? '{$semester_aktif}' }}
                    </td>
                    <td>
                        <table style="border-collapse: collapse; border: none; width: 100%; font-size: 10pt;">
                            <tr><td style="border:none; padding:2px; width: 130px;">Materi Keahlian Prodi</td><td style="border:none; padding:2px; width: 10px;">:</td><td style="border:none; padding:2px;">{{ $penguji_1 ?? '{$penguji_1}' }}</td></tr>
                            <tr><td style="border:none; padding:2px;">Materi Keislaman</td><td style="border:none; padding:2px;">:</td><td style="border:none; padding:2px;">{{ $penguji_2 ?? '{$penguji_2}' }}</td></tr>
                        </table>
                    </td>
                    <td class="center">
                        {{ $waktu_sidang ?? '{$waktu_sidang}' }}
                    </td>
                </tr>
            </tbody>
        </table>

        <div style="margin-bottom: 10px;">
            Demikian agar dilaksanakan sebagaimana mestinya.
        </div>

        <table style="width: 100%; border: none;">
            <tr>
                <td style="width: 55%; border: none;"></td>
                <td style="width: 45%; border: none; text-align: left; font-size: 10pt; line-height: 1.2;">
                    Serang, {{ $tanggal_surat ?? '{$tanggal_surat}' }}<br>
                    a.n. Dekan<br>
                    <div style="padding-left: 20px;">Wakil Dekan Bidang Akademik</div>
                    <div style="padding-left: 20px;">dan Kelembagaan</div>
                    <div style="min-height: 70px; padding-left: 20px; display: flex; align-items: center;">
                        {!! $ttd ?? '' !!}
                    </div>
                    <div class="bold" style="padding-left: 20px; text-decoration: underline;">{{ $nama_wakil_dekan ?? '{$nama_wakil_dekan}' }}</div>
                    <div style="padding-left: 20px;">NIP. {{ $nip_wakil_dekan ?? '{$nip_wakil_dekan}' }}</div>
                </td>
            </tr>
        </table>

        <table class="catatan-table">
            <tr><td colspan="3" class="bold underline">Catatan:</td></tr>
            <tr>
                <td style="width: 120px;">Materi Keislaman</td><td style="width: 10px;">:</td>
                <td>Ushul Fiqh, Ulumul Hadis, Ulumul Qur'an dan MSI</td>
            </tr>
            <tr>
                <td>Materi Keahlian Prodi</td><td>:</td>
                <td>Ilmu Rijal al-Hadis, al-Jarh wa al-Ta'dil, Takhrij Hadis, Studi Kritik Matan Hadis, al-Qowa'id al-Haditsiyyah</td>
            </tr>
        </table>

        <div class="catatan-mhs">
            <div class="bold italic underline">Catatan bagi Mahasiswa:</div>
            <div class="catatan-mhs-list">
                <ol>
                    <li>Mahasiswa diwajibkan berpakaian dengan ketentuan:
                        <ol>
                            <li>Berpakaian putih, berdasi dan berjas hitam (laki-laki),</li>
                            <li>Berpakaian muslimah dan blazer hitam (perempuan),</li>
                        </ol>
                    </li>
                    <li>Mahasiswa yang mengikuti ujian Komprehensif diwajibkan hadir 15 Menit sebelum siding dimulai;</li>
                </ol>
            </div>
        </div>

        <div class="footer">
            <table class="footer-table">
                <tr>
                    <td class="qrcode-cell">
                        @if(isset($qrcode) && $qrcode)
                            <img src="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($qrcode) }}" alt="Scan QR untuk verifikasi keaslian dokumen">
                        @endif
                    </td>
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
                    <img src="{{ $logoSrc }}" alt="Logo UIN" onerror="this.style.display='none'">
                </td>
                <td class="header-text">
                    <p class="kop-1">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                    <p class="kop-2">UNIVERSITAS ISLAM NEGERI</p>
                    <p class="kop-2">SULTAN MAULANA HASANUDDIN BANTEN</p>
                    <p class="kop-3">FAKULTAS USHULUDDIN DAN ADAB</p>
                    <p class="kop-4">Jalan Syekh Nawawi Kp. Andamui Kel. Sukawana Kec. Curug Kota Serang Banten 42171<br>
                        Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
                        Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u></p>
                </td>
            </tr>
        </table>

        <div class="form-code">Form I K</div>
        <div class="center" style="font-size: 12pt; font-weight: bold; margin-bottom: 10px; margin-top: 0px;">
            Berita Acara Keputusan Sidang<br>
            <span class="underline">UJIAN KOMPREHENSIP</span>
        </div>

        <table class="bio-table">
            <tr><td class="bio-label">Nama Mahasiswa</td><td class="bio-colon">:</td><td>{{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}</td></tr>
            <tr><td>Nomor Induk Mahasiswa</td><td>:</td><td>{{ $nim ?? '{$nim}' }}</td></tr>
            <tr><td>Semester</td><td>:</td><td>{{ $semester_aktif ?? '{$semester_aktif}' }}</td></tr>
            <tr><td>Jurusan</td><td>:</td><td>{{ $nama_prodi ?? '{$nama_prodi}' }}</td></tr>
            <tr><td>Fakultas</td><td>:</td><td>USHULUDDIN DAN ADAB</td></tr>
            <tr><td>Tahun Akademik</td><td>:</td><td>{{ $tahun_akademik ?? '{$tahun_akademik}' }}</td></tr>
            <tr><td>Nilai</td><td>:</td><td>A / A- / B+ / B / B- / C+ / C *</td></tr>
        </table>

        <div class="center" style="font-size: 12pt; font-weight: bold; margin-top: 25px; margin-bottom: 25px;">
            <span class="underline">KEPUTUSAN DEWAN PENGUJI</span>
        </div>

        <div class="justify" style="margin-bottom: 15px; line-height: 1.5;">
            Setelah melihat dan mempertimbangkan hasil ujian komprehensip mahasiswa tersebut di atas dinyatakan : <span class="bold italic">LULUS / TIDAK LULUS.*</span>
        </div>

        <div style="text-align: right; margin-bottom: 10px;">
            Serang, {{ $tanggal_sidang ?? '{$tanggal_sidang}' }}
        </div>

        <div class="center" style="font-size: 12pt; font-weight: bold; margin-bottom: 15px;">
            <span class="underline">DEWAN PENGUJI</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11pt; line-height: 2.0;">
            <tr>
                <td style="width: 30px;">1.</td>
                <td style="width: 250px;">Penguji Keahlian Prodi</td>
                <td style="width: 15px;">:</td>
                <td>{{ $penguji_1 ?? '{$penguji_1}' }}</td>
                <td style="width: 100px;">(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</td>
            </tr>
            <tr>
                <td>2.</td>
                <td>Penguji Keislaman</td>
                <td>:</td>
                <td>{{ $penguji_2 ?? '{$penguji_2}' }}</td>
                <td>(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</td>
            </tr>
        </table>

        <div style="margin-top: 20px; font-size: 10pt;">
            * Coret yang tidak perlu<br>
            <span class="underline bold">Keterangan Nilai :</span>
            <table class="tabel-taksiran">
                <tr><th>No</th><th>Nilai</th><th>Bobot</th><th>Komulatif</th></tr>
                <tr><td>1</td><td>A</td><td>95-100</td><td>4.00</td></tr>
                <tr><td>2</td><td>A-</td><td>90-94</td><td>3.75</td></tr>
                <tr><td>3</td><td>B+</td><td>85-89</td><td>3.50</td></tr>
                <tr><td>4</td><td>B</td><td>80-84</td><td>3.25</td></tr>
                <tr><td>5</td><td>B-</td><td>75-79</td><td>3.00</td></tr>
                <tr><td>6</td><td>C+</td><td>70-74</td><td>2.75</td></tr>
                <tr><td>7</td><td>C</td><td>65-69</td><td>2.50</td></tr>
            </table>
        </div>
    </div>


    <div class="page">
        <table class="header-table double-line">
            <tr>
                <td class="header-logo">
                    <img src="{{ $logoSrc }}" alt="Logo UIN" onerror="this.style.display='none'">
                </td>
                <td class="header-text">
                    <p class="kop-1">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                    <p class="kop-2">UNIVERSITAS ISLAM NEGERI</p>
                    <p class="kop-2">SULTAN MAULANA HASANUDDIN BANTEN</p>
                    <p class="kop-3">FAKULTAS USHULUDDIN DAN ADAB</p>
                    <p class="kop-4">Jalan Syekh Nawawi Kp. Andamui Kel. Sukawana Kec. Curug Kota Serang Banten 42171<br>
                        Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
                        Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u></p>
                </td>
            </tr>
        </table>

        <div class="form-code">Form II K</div>
        <div class="center" style="font-size: 12pt; font-weight: bold; margin-bottom: 10px; margin-top: 0px;">
            <span class="underline">REKAPITULASI NILAI KOMPREHENSIP</span>
        </div>

        <table class="bio-table">
            <tr><td class="bio-label">Nama Mahasiswa</td><td class="bio-colon">:</td><td colspan="2">{{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}</td></tr>
            <tr><td>Nomor Induk Mahasiswa</td><td>:</td><td colspan="2">{{ $nim ?? '{$nim}' }}</td></tr>
            <tr><td>Semester</td><td>:</td><td colspan="2">{{ $semester_aktif ?? '{$semester_aktif}' }}</td></tr>
            <tr><td>Jurusan</td><td>:</td><td colspan="2">{{ $nama_prodi ?? '{$nama_prodi}' }}</td></tr>
            <tr><td>Fakultas</td><td>:</td><td colspan="2">USHULUDDIN DAN ADAB</td></tr>
            <tr><td>Tahun Akademik</td><td>:</td><td colspan="2">{{ $tahun_akademik ?? '{$tahun_akademik}' }}</td></tr>
            <tr><td>Nilai</td><td>:</td><td colspan="2">A / A- / B+ / B / B- / C+ / C *</td></tr>
            <tr><td>1. Penguji Keahlian Prodi</td><td>:</td><td>{{ $penguji_1 ?? '{$penguji_1}' }}</td><td style="width: 50px;">(X1)</td></tr>
            <tr><td>2. Penguji Keislaman</td><td>:</td><td>{{ $penguji_2 ?? '{$penguji_2}' }}</td><td>(X2)</td></tr>
            <tr><td style="height: 2px;" colspan="4"></td></tr>
            <tr><td>Nilai</td><td>:</td><td colspan="2"></td></tr>
        </table>

        <div class="rumus" style="margin-bottom: 0;">
            <div style="margin-bottom: 2px;">P = <span class="rumus-frac"><span class="rumus-num">X1 + X2</span><span class="rumus-den">2</span></span></div>
            <div style="margin-bottom: 2px;">P = <span class="rumus-frac"><span class="rumus-num" style="min-width: 50px;">&nbsp;</span><span class="rumus-den">2</span></span></div>
            <div style="margin-bottom: 2px;">P = <span class="rumus-frac"><span class="rumus-num" style="min-width: 100px;">&nbsp;</span><span class="rumus-den">2</span></span></div>
            <div>P = </div>
        </div>

        <div style="margin-top: 10px; font-size: 10pt;">
            <span class="bold italic underline">Keterangan Nilai :</span>
            <table class="tabel-taksiran">
                <tr><th>No</th><th>Nilai</th><th>Bobot</th><th>Komulatif</th></tr>
                <tr><td>1</td><td>A</td><td>95-100</td><td>4.00</td></tr>
                <tr><td>2</td><td>A-</td><td>90-94</td><td>3.75</td></tr>
                <tr><td>3</td><td>B+</td><td>85-89</td><td>3.50</td></tr>
                <tr><td>4</td><td>B</td><td>80-84</td><td>3.25</td></tr>
                <tr><td>5</td><td>B-</td><td>75-79</td><td>3.00</td></tr>
                <tr><td>6</td><td>C+</td><td>70-74</td><td>2.75</td></tr>
                <tr><td>7</td><td>C</td><td>65-69</td><td>2.50</td></tr>
            </table>
        </div>
    </div>


    <div class="page">
        <table class="header-table double-line">
            <tr>
                <td class="header-logo">
                    <img src="{{ $logoSrc }}" alt="Logo UIN" onerror="this.style.display='none'">
                </td>
                <td class="header-text">
                    <p class="kop-1">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                    <p class="kop-2">UNIVERSITAS ISLAM NEGERI</p>
                    <p class="kop-2">SULTAN MAULANA HASANUDDIN BANTEN</p>
                    <p class="kop-3">FAKULTAS USHULUDDIN DAN ADAB</p>
                    <p class="kop-4">Jalan Syekh Nawawi Kp. Andamui Kel. Sukawana Kec. Curug Kota Serang Banten 42171<br>
                        Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
                        Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u></p>
                </td>
            </tr>
        </table>

        <div class="form-code">Form III K</div>
        <div class="center" style="font-size: 12pt; font-weight: bold; margin-bottom: 5px; margin-top: 0px;">
            <span class="underline">NILAI UJIAN KOMPREHENSIP</span>
        </div>
        <div class="center" style="font-size: 10pt; margin-bottom: 10px;">
            MATA KULIAH KOMPONEN DASAR
        </div>

        <table class="bio-table">
            <tr><td class="bio-label">Nama Mahasiswa</td><td class="bio-colon">:</td><td>{{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}</td></tr>
            <tr><td>Nomor Induk Mahasiswa</td><td>:</td><td>{{ $nim ?? '{$nim}' }}</td></tr>
            <tr><td>Semester</td><td>:</td><td>{{ $semester_aktif ?? '{$semester_aktif}' }}</td></tr>
            <tr><td>Jurusan</td><td>:</td><td>{{ $nama_prodi ?? '{$nama_prodi}' }}</td></tr>
            <tr><td>Fakultas</td><td>:</td><td>USHULUDDIN DAN ADAB</td></tr>
            <tr><td>Tahun Akademik</td><td>:</td><td>{{ $tahun_akademik ?? '{$tahun_akademik}' }}</td></tr>
            <tr><td>Nilai</td><td>:</td><td>A / A- / B+ / B / B- / C+ / C *</td></tr>
        </table>

        <table style="width: 100%; border: none; margin-top: 20px;">
            <tr>
                <td style="width: 55%; border: none;"></td>
                <td style="width: 45%; border: none; text-align: left; font-size: 11pt; line-height: 1.2;">
                    Serang, {{ $tanggal_sidang ?? '{$tanggal_sidang}' }}<br>
                    Penguji Materi Keahlian Prodi,<br>
                    <div style="height: 60px;"></div>
                    <span class="bold">{{ $penguji_1 ?? '{$penguji_1}' }}</span>
                </td>
            </tr>
        </table>

        <div style="margin-top: 20px; font-size: 11pt;">
            * Coret yang tidak perlu
        </div>

        <div style="margin-top: 5px; font-size: 10pt;">
            <span class="bold underline">Keterangan Nilai :</span>
            <table class="tabel-taksiran">
                <tr><th>No</th><th>Nilai</th><th>Bobot</th><th>Komulatif</th></tr>
                <tr><td>1</td><td>A</td><td>95-100</td><td>4.00</td></tr>
                <tr><td>2</td><td>A-</td><td>90-94</td><td>3.75</td></tr>
                <tr><td>3</td><td>B+</td><td>85-89</td><td>3.50</td></tr>
                <tr><td>4</td><td>B</td><td>80-84</td><td>3.25</td></tr>
                <tr><td>5</td><td>B-</td><td>75-79</td><td>3.00</td></tr>
                <tr><td>6</td><td>C+</td><td>70-74</td><td>2.75</td></tr>
                <tr><td>7</td><td>C</td><td>65-69</td><td>2.50</td></tr>
            </table>
        </div>
    </div>


    <div class="page" style="page-break-after: avoid !important;">
        <table class="header-table double-line">
            <tr>
                <td class="header-logo">
                    <img src="{{ $logoSrc }}" alt="Logo UIN" onerror="this.style.display='none'">
                </td>
                <td class="header-text">
                    <p class="kop-1">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
                    <p class="kop-2">UNIVERSITAS ISLAM NEGERI</p>
                    <p class="kop-2">SULTAN MAULANA HASANUDDIN BANTEN</p>
                    <p class="kop-3">FAKULTAS USHULUDDIN DAN ADAB</p>
                    <p class="kop-4">Jalan Syekh Nawawi Kp. Andamui Kel. Sukawana Kec. Curug Kota Serang Banten 42171<br>
                        Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
                        Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u></p>
                </td>
            </tr>
        </table>

        <div class="form-code">Form IV K</div>
        <div class="center" style="font-size: 12pt; font-weight: bold; margin-bottom: 5px; margin-top: 0px;">
            <span class="underline">NILAI UJIAN KOMPREHENSIP</span>
        </div>
        <div class="center" style="font-size: 10pt; margin-bottom: 10px;">
            MATA KULIAH KOMPONEN PENDUKUNG
        </div>

        <table class="bio-table">
            <tr><td class="bio-label">Nama Mahasiswa</td><td class="bio-colon">:</td><td>{{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}</td></tr>
            <tr><td>Nomor Induk Mahasiswa</td><td>:</td><td>{{ $nim ?? '{$nim}' }}</td></tr>
            <tr><td>Semester</td><td>:</td><td>{{ $semester_aktif ?? '{$semester_aktif}' }}</td></tr>
            <tr><td>Jurusan</td><td>:</td><td>{{ $nama_prodi ?? '{$nama_prodi}' }}</td></tr>
            <tr><td>Fakultas</td><td>:</td><td>USHULUDDIN DAN ADAB</td></tr>
            <tr><td>Tahun Akademik</td><td>:</td><td>{{ $tahun_akademik ?? '{$tahun_akademik}' }}</td></tr>
            <tr><td>Nilai</td><td>:</td><td>A / A- / B+ / B / B- / C+ / C *</td></tr>
        </table>

        <table style="width: 100%; border: none; margin-top: 20px;">
            <tr>
                <td style="width: 55%; border: none;"></td>
                <td style="width: 45%; border: none; text-align: left; font-size: 11pt; line-height: 1.2;">
                    Serang, {{ $tanggal_sidang ?? '{$tanggal_sidang}' }}<br>
                    Penguji Materi Keislaman,<br>
                    <div style="height: 60px;"></div>
                    <span class="bold">{{ $penguji_2 ?? '{$penguji_2}' }}</span>
                </td>
            </tr>
        </table>

        <div style="margin-top: 20px; font-size: 11pt;">
            * Coret yang tidak perlu
        </div>

        <div style="margin-top: 5px; font-size: 10pt;">
            <span class="bold underline">Keterangan Nilai :</span>
            <table class="tabel-taksiran">
                <tr><th>No</th><th>Nilai</th><th>Bobot</th><th>Komulatif</th></tr>
                <tr><td>1</td><td>A</td><td>95-100</td><td>4.00</td></tr>
                <tr><td>2</td><td>A-</td><td>90-94</td><td>3.75</td></tr>
                <tr><td>3</td><td>B+</td><td>85-89</td><td>3.50</td></tr>
                <tr><td>4</td><td>B</td><td>80-84</td><td>3.25</td></tr>
                <tr><td>5</td><td>B-</td><td>75-79</td><td>3.00</td></tr>
                <tr><td>6</td><td>C+</td><td>70-74</td><td>2.75</td></tr>
                <tr><td>7</td><td>C</td><td>65-69</td><td>2.50</td></tr>
            </table>
        </div>
    </div>

</body>
</html>