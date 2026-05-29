<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Surat Tugas & Berita Acara Munaqasyah - {{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}</title>
    <style>
        /* ================= PENGATURAN UMUM ================= */
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
            
            .page { 
                margin: 0; 
                padding: 10mm 20mm 15mm 20mm;
                box-shadow: none; 
                page-break-after: always; 
                page-break-inside: avoid;
                width: 210mm; 
                height: 297mm;
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
            padding: 5px 20mm;
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
            color: #000;
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
            line-height: 1.2;
            padding-left: 10px;
        }

        /* ================= TYPOGRAPHY & LAYOUT ================= */
        .doc-title { text-align: center; font-size: 12pt; font-weight: bold; margin-bottom: 15px; margin-top: 15px; }
        .justify { text-align: justify; line-height: 1.0;}
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .underline { text-decoration: underline; }

        /* ================= TABEL BIODATA ================= */
        .bio-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11pt; }
        .bio-table td { vertical-align: top; padding: 2px 0; line-height: 1.0; border: none; }
        .bio-label { width: 160px; }
        .bio-colon { width: 15px; text-align: center; }
        
        .checkbox-char { font-family: Arial, sans-serif; font-size: 14pt; }
        .yudicium-box { display: inline-block; width: 15px; height: 15px; border: 1px solid black; margin-left: 10px; vertical-align: middle; }
        .box-text { display: inline-block; width: 170px; font-weight: bold; }
        .yudicium-container { margin-left: 175px; margin-top: 8px; margin-bottom: 8px; }

        /* ================= TANDA TANGAN ================= */
        .sig-table { width: 100%; margin-top: 15px; text-align: center; }
        .sig-table td { width: 50%; vertical-align: top; border: none; }
        .sig-space { height: 45px; }
        .line-name { border-bottom: 1px solid black; display: inline-block; padding-bottom: 2px; margin-bottom: 2px; min-width: 220px; font-weight: normal; }
        
        /* ================= TABEL SURAT TUGAS & PENILAIAN ================= */
        .tabel-tugas { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt; table-layout: fixed; }
        .tabel-tugas th, .tabel-tugas td { border: 1px solid black; padding: 5px; vertical-align: top; word-wrap: break-word; }
        .tabel-tugas th { text-align: center; font-weight: bold; vertical-align: middle; }
        
        .tabel-nilai { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 10px; font-size: 11pt; }
        .tabel-nilai th, .tabel-nilai td { border: 1px solid black; padding: 5px 6px; }
        .tabel-nilai th { text-align: center; font-weight: bold; background-color: #e0e0e0; vertical-align: middle; }

        .tabel-taksiran { border-collapse: collapse; font-size: 9pt; margin-top: 5px; width: 250px; }
        .tabel-taksiran th, .tabel-taksiran td { border: 1px solid black; padding: 3px 5px; text-align: center; }
        .tabel-taksiran th { background-color: #e0e0e0; font-weight: bold; }
        
        /* ================= UTILITAS LAINNYA ================= */
        .fraction { display: inline-block; text-align: center; vertical-align: middle; margin: 0 10px; }
        .numerator { border-bottom: 1px solid black; padding: 0 5px; }
        .denominator { padding: 0 5px; }
        .catatan-berita { font-size: 10pt; margin-top: 10px; }
        
        .text-arial-sm { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; line-height: 1.2; }
    </style>
</head>
<body>

    @php
        // LOGIKA CHECKBOX
        $jk_L = ($jk ?? 'P') == 'L' ? '&#9745;' : '&#9744;';
        $jk_P = ($jk ?? 'P') == 'P' ? '&#9745;' : '&#9744;';
        $prodi_FA = ($kode_prodi ?? '{$kode_prodi}') == 'FA' ? '&#9745;' : '&#9744;';
        $prodi_IAT = ($kode_prodi ?? '{$kode_prodi}') == 'IAT' ? '&#9745;' : '&#9744;';
        $prodi_IH = ($kode_prodi ?? '{$kode_prodi}') == 'IH' ? '&#9745;' : '&#9744;';
    @endphp

    <!-- PAGE 1: SURAT TUGAS -->
    <div class="page page-first">
        <!-- HEADER -->
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

        <div class="center" style="margin-bottom: 12px;">
            <div style="font-size: 14pt; font-weight: bold; letter-spacing: 2px;">
                <span class="underline">SURAT TUGAS</span>
            </div>
            <div style="font-size: 10pt; margin-top: 2px;">{{ $nomor_surat ?? '455/Un.17/F.III.1/KP.01.2/04/2018' }}</div>
        </div>

        <div class="justify" style="margin-bottom: 10px;">
            Dekan Fakultas Ushuluddin dan Adab Universitas Islam Negeri Sultan Maulana Hasanuddin Banten menugaskan dosen-dosen yang namanya tersebut pada kolom dalam daftar di bawah ini untuk duduk dalam <b>Majelis Penguji Skripsi</b> terhadap mahasiswa yang namanya terlampir dalam daftar di bawah ini. Ujian Skripsi akan dilaksanakan pada hari <b>{{ $hari_sidang ?? '{$hari_sidang}' }}</b>, tanggal <b>{{ $tanggal_sidang ?? '{$tanggal_sidang}' }}</b> mulai jam <b>{{ $waktu_sidang ?? '{$waktu_sidang}' }} WIB</b> sampai dengan selesai di <b>{{ $ruang_sidang ?? '{$ruang_sidang}' }}</b> Fakultas Ushuluddin dan Adab.
        </div>

        <div style="text-align: right; font-weight: bold; font-size: 10pt; margin-bottom: 3px;">{{ $ruang_sidang ?? '{$ruang_sidang}' }}</div>
        
        <table class="tabel-tugas">
            <thead>
                <tr>
                    <th style="width: 5%;">NO</th>
                    <th style="width: 30%;">NAMA/NIM/JUR/<br>JUDUL SKRIPSI</th>
                    <th style="width: 55%;">MAJELIS PENGUJI</th>
                    <th style="width: 10%;">WAKTU</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="center" style="vertical-align: middle;">1</td>
                    <td class="center" style="vertical-align: middle;">
                        <b>{{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}<br>{{ $nim ?? '{$nim}' }}/{{ $kode_prodi ?? '{$kode_prodi}' }}</b><br><br>
                        {{ $judul_disetujui ?? '{$judul_disetujui}' }}
                    </td>
                    <td>
                        <table style="border-collapse: collapse; border: none; width: 100%; font-size: 10pt;">
                            <tr><td style="border:none; padding:2px; width: 90px;">Ketua</td><td style="border:none; padding:2px; width: 10px;">:</td><td style="border:none; padding:2px;">{{ $ketua_sidang ?? '{$ketua_sidang}' }}</td></tr>
                            <tr><td style="border:none; padding:2px;">Sekretaris</td><td style="border:none; padding:2px;">:</td><td style="border:none; padding:2px;">{{ $sekretaris_sidang ?? '{$sekretaris_sidang}' }}</td></tr>
                            <tr><td style="border:none; padding:2px;">Pembimbing I</td><td style="border:none; padding:2px;">:</td><td style="border:none; padding:2px;">{{ $pembimbing_1 ?? '{$pembimbing_1}' }}</td></tr>
                            <tr><td style="border:none; padding:2px;">Pembimbing II</td><td style="border:none; padding:2px;">:</td><td style="border:none; padding:2px;">{{ $pembimbing_2 ?? '{$pembimbing_2}' }}</td></tr>
                            <tr><td style="border:none; padding:2px;">Penguji I</td><td style="border:none; padding:2px;">:</td><td style="border:none; padding:2px;">{{ $penguji_1 ?? '{$penguji_1}' }}</td></tr>
                            <tr><td style="border:none; padding:2px;">Penguji II</td><td style="border:none; padding:2px;">:</td><td style="border:none; padding:2px;">{{ $penguji_2 ?? '{$penguji_2}' }}</td></tr>
                        </table>
                    </td>
                    <td class="center" style="vertical-align: middle;">
                        {{ $waktu_sidang ?? '{$waktu_sidang}' }}
                    </td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top: 10px; margin-bottom: 15px;">
            Demikian agar dilaksanakan sebagaimana mestinya.
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            <div style="text-align: left; width: 280px;">
                Serang, {{ $tanggal_surat ?? '{$tanggal_surat}' }}<br>
                Dekan,<br>
                Fakultas Ushuluddin dan Adab
                <div style="min-height: 70px; display: flex; align-items: center;">
                    {!! $ttd ?? '' !!}
                </div>
                <div class="bold" style="text-decoration: underline;">{{ $nama_dekan ?? '{$nama_dekan}' }}</div>
                NIP. {{ $nip_dekan ?? '{$nip_dekan}' }}
            </div>
        </div>

        <div class="text-arial-sm" style="margin-top: 15px; margin-bottom: 10px;">
            <b><i>Tembusan disampaikan :</i></b><br>
            <ol style="margin-top: 2px; margin-bottom: 10px; padding-left: 15px;">
                <li>Dekan Fakultas Ushuluddin dan Adab sebagai Laporan;</li>
                <li>Wakil Dekan I, II dan III;</li>
                <li>Ketua Jurusan {{ $kode_prodi ?? '{$kode_prodi}' }};</li>
                <li>Mahasiswa yang bersangkutan.</li>
            </ol>

            Catatan:<br>
            <ol style="margin-top: 2px; padding-left: 15px;">
                <li>Mahasiswa diwajibkan berpakaian dengan ketentuan:<br>
                    <div style="margin-left: 15px; margin-top: 2px;">a. Berpakaian putih, berdasi dan berjas hitam (laki-laki)</div>
                    <div style="margin-left: 15px;">b. Berpakaian muslimah dan berjas hitam (perempuan)</div>
                </li>
                <li>Penguji yang tidak hadir pada waktu ujian, akan diganti oleh penguji yang lain.</li>
                <li>Seluruh mahasiswa yang mengikuti ujian munaqosah diwajibkan hadir 30 menit sebelum acara dimulai</li>
                <li>Seluruh mahasiswa yang mengikuti ujian munaqosah diwajibkan mengikuti penutupan siding</li>
                <li>Bagi mahasiswa yang tidak mengikuti pembukaan dan penutupan akan ditangguhkan kelulusannya</li>
            </ol>
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


    <!-- PAGE 2: BERITA ACARA -->
    <div class="page">
        <!-- HEADER -->
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

        <div class="doc-title">
            <span class="underline">BERITA ACARA DAN KEPUTUSAN SIDANG MUNAQASYAH</span>
        </div>

        <table class="bio-table">
            <tr>
                <td class="bio-label">Nama Mahasiswa</td>
                <td class="bio-colon">:</td>
                <td style="width: 350px;">{{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}</td>
                <td style="text-align: right;"><span class="checkbox-char">{!! $jk_L !!}</span> L | <span class="checkbox-char">{!! $jk_P !!}</span> P<sup>*</sup></td>
            </tr>
            <tr>
                <td>Tempat Tanggal Lahir</td>
                <td>:</td>
                <td colspan="2">{{ $tempat_lahir_mahasiswa ?? '{$tempat_lahir_mahasiswa}' }}, {{ $tanggal_lahir_mahasiswa ?? '{$tanggal_lahir_mahasiswa}' }}</td>
            </tr>
            <tr>
                <td>NIM / Jurusan</td>
                <td>:</td>
                <td colspan="2">{{ $nim ?? '{$nim}' }} /{{ $kode_prodi ?? '{$kode_prodi}' }} &nbsp;&nbsp;|&nbsp; <span class="checkbox-char">{!! $prodi_FA !!}</span> FA <span class="checkbox-char">{!! $prodi_IAT !!}</span> IAT <span class="checkbox-char">{!! $prodi_IH !!}</span> IH<sup>*</sup></td>
            </tr>
            <tr>
                <td>Tahun Akademik</td>
                <td>:</td>
                <td colspan="2">{{ $tahun_akademik ?? '{$tahun_akademik}' }} &nbsp;&nbsp;&nbsp;&nbsp; Semester : {{ $semester_aktif ?? '{$semester_aktif}' }}</td>
            </tr>
            <tr>
                <td>Program yang ditempuh</td>
                <td>:</td>
                <td class="justify" colspan="2">Ujian-ujian tulis, Praktikum, Ujian Komprehensip, Ujian Khusus dan Ujian Skripsi ( <i>lihat lampiran</i> )</td>
            </tr>
        </table>

        <div class="center bold" style="margin-top: 15px; margin-bottom: 8px;">KEPUTUSAN SIDANG MUNAQASYAH</div>
        
        <div class="justify" style="margin-bottom: 5px;">
            Setelah melihat dan mempertimbangkan hasil ujian-ujian, maka dengan ini Dewan Penguji Skripsi Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten, memutuskan bahwa saudara dinyatakan <b>LULUS/TIDAK LULUS</b><sup>*</sup> dari Ujian Sarjana Program Strata Satu (S.1) dalam Ilmu Agama Islam (Ushuluddin dan Adab) dengan Yudicium<sup>*</sup>:
        </div>

        <div class="yudicium-container">
            <div><span class="box-text">PUJIAN</span> <span class="yudicium-box"></span></div>
            <div style="margin-top: 4px;"><span class="box-text">SANGAT MEMUASKAN</span> <span class="yudicium-box"></span></div>
            <div style="margin-top: 4px;"><span class="box-text">MEMUASKAN</span> <span class="yudicium-box"></span></div>
        </div>

        <div class="justify">
            <div style="display: flex; justify-content: space-between;">
                <div>Dengan Indeks Prestasi Komulatif (IPK) ..........</div>
                <div>( ............................................................................ )</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                <div>dan saudara berhak memakai gelar<sup>*</sup>:</div>
                <div><b>Sarjana Agama (S.Ag)</b> <span class="yudicium-box"></span></div>
            </div>
        </div>
        
        <div class="justify" style="margin-top: 8px; margin-bottom: 10px;">
            dalam Ilmu Ushuluddin dan Adab. Sebagai tanda lulus akan diberikan ijazah yang ditandatangani oleh Rektor UIN Sultan Maulana Hasanuddin Banten dan Dekan Fakultas Ushuluddin dan Adab, setelah saudara menyelesaikan ketentuan-ketentuan dari hasil Ujian Skripsi ini. Secara resmi Ijazah akan diserahkan pada waktu Pelaksanaan Wisuda Sarjana.
        </div>

        <div style="text-align: right; margin-top: 10px; margin-bottom: 10px;">
            Serang, {{ $tanggal_sidang ?? '{$tanggal_sidang}' }}
        </div>

        <div class="center bold">DEWAN PENGUJI SKRIPSI</div>

        <table class="sig-table">
            <tr>
                <td>Ketua,</td>
                <td>Sekretaris,</td>
            </tr>
            <tr><td class="sig-space"></td><td></td></tr>
            <tr>
                <td>
                    <div class="line-name">{{ $ketua_sidang ?? '{$ketua_sidang}' }}</div><br>Anggota,
                </td>
                <td>
                    <div class="line-name">{{ $sekretaris_sidang ?? '{$sekretaris_sidang}' }}</div><br>Anggota,
                </td>
            </tr>
            <tr><td class="sig-space"></td><td></td></tr>
            <tr>
                <td>
                    <div class="line-name">{{ $pembimbing_1 ?? '{$pembimbing_1}' }}</div><br>Anggota,
                </td>
                <td>
                    <div class="line-name">{{ $pembimbing_2 ?? '{$pembimbing_2}' }}</div><br>Anggota,
                </td>
            </tr>
            <tr><td class="sig-space"></td><td></td></tr>
            <tr>
                <td>
                    <div class="line-name">{{ $penguji_1 ?? '{$penguji_1}' }}</div>
                </td>
                <td>
                    <div class="line-name">{{ $penguji_2 ?? '{$penguji_2}' }}</div>
                </td>
            </tr>
        </table>

        <div class="catatan-berita">
            <span style="text-decoration: underline; font-style: italic;">Catatan:</span><br>
            <ul style="margin-top: 3px; padding-left: 20px;">
                <li style="margin-bottom: 3px;">Saudara diwajibkan/tidak diwajibkan untuk memperbaiki Skripsi selambat-lambatnya tiga bulan setelah keputusan ini ditetapkan.</li>
                <li><sup>*</sup><i>Coret yang tidak perlu. <span class="checkbox-char">&#9745;</span> Pilih yang sesuai.</i></li>
            </ul>
        </div>
    </div>


    <!-- PAGE 3: DATA PENENTUAN YUDICIUM -->
    <div class="page">
        <!-- HEADER -->
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

        <div class="doc-title" style="line-height: 1.2;">
            <span class="underline">DATA PENENTUAN YUDICIUM</span><br>
            ( INDEKS PRESTASI KOMULATIF )
        </div>

        <table class="bio-table">
            <tr>
                <td class="bio-label">Nama Mahasiswa</td>
                <td class="bio-colon">:</td>
                <td style="width: 350px;">{{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}</td>
                <td style="text-align: right;"><span class="checkbox-char">{!! $jk_L !!}</span> L | <span class="checkbox-char">{!! $jk_P !!}</span> P<sup>*</sup></td>
            </tr>
            <tr>
                <td>Tempat Tanggal Lahir</td>
                <td>:</td>
                <td colspan="2">{{ $tempat_lahir_mahasiswa ?? '{$tempat_lahir_mahasiswa}' }}, {{ $tanggal_lahir_mahasiswa ?? '{$tanggal_lahir_mahasiswa}' }}</td>
            </tr>
            <tr>
                <td>NIM / Jurusan</td>
                <td>:</td>
                <td colspan="2">{{ $nim ?? '{$nim}' }} /{{ $kode_prodi ?? '{$kode_prodi}' }}</td>
            </tr>
            <tr>
                <td>Tahun Akademik</td>
                <td>:</td>
                <td colspan="2">{{ $tahun_akademik ?? '{$tahun_akademik}' }} | Semester : {{ $semester_aktif ?? '{$semester_aktif}' }}</td>
            </tr>
            <tr>
                <td>Judul Skripsi</td>
                <td>:</td>
                <td colspan="2">{{ $judul_disetujui ?? '{$judul_disetujui}' }}</td>
            </tr>
        </table>

        <table style="width: 100%; margin-top: 25px; margin-bottom: 25px;">
            <tr>
                <td style="width: 150px;">Rumus</td>
                <td style="width: 20px;">:</td>
                <td class="bold" style="width: 60px;">IPK =</td>
                <td style="width: 120px;">
                    <div class="fraction">
                        <div class="numerator" style="font-size: 14pt;">&Sigma;XY</div>
                        <div class="denominator" style="font-size: 14pt;">&Sigma;Y</div>
                    </div>
                </td>
                <td><span style="font-size: 9pt;">(Jumlah X dikali Y)<br>(Jumlah Y)</span></td>
            </tr>
            <tr><td colspan="5" style="height: 15px;"></td></tr>
            <tr>
                <td style="vertical-align: top;">Keterangan</td>
                <td style="vertical-align: top;">:</td>
                <td colspan="3">
                    <table style="border:none; padding:0; margin:0; line-height: 1.5;">
                        <tr><td style="width: 60px;">IPK</td><td>=</td><td>Indeks Prestasi Komulatif</td></tr>
                        <tr><td>X</td><td>=</td><td>Nilai Ujian-ujian Mata Kuliah</td></tr>
                        <tr><td>Y</td><td>=</td><td>Bobot Kredit (sks) Mata Kuliah</td></tr>
                    </table>
                </td>
            </tr>
            <tr><td colspan="5" style="height: 30px;"></td></tr>
            <tr>
                <td>Indeks Prestasi Komulatif</td>
                <td>:</td>
                <td class="bold">IPK =</td>
                <td colspan="2">
                    <div class="fraction">
                        <div class="numerator">....................</div>
                        <div class="denominator">....................</div>
                    </div>
                </td>
            </tr>
            <tr><td colspan="5" style="height: 15px;"></td></tr>
            <tr>
                <td></td>
                <td></td>
                <td class="bold">IPK =</td>
                <td colspan="2"></td>
            </tr>
            <tr><td colspan="5" style="height: 25px;"></td></tr>
            <tr>
                <td>YUDICIUM</td>
                <td>:</td>
                <td colspan="3">
                    <table style="border-collapse: collapse; border: 2px solid black;">
                        <tr>
                            <td style="border: 2px solid black; padding: 6px 15px; font-weight: bold;">MEMUASKAN</td>
                            <td style="border: 2px solid black; padding: 6px 15px; font-weight: bold;">SANGAT MEMUASKAN</td>
                            <td style="border: 2px solid black; padding: 6px 15px; font-weight: bold;">PUJIAN<sup>*</sup></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <div style="display: flex; justify-content: flex-end; margin-top: 30px;">
            <div style="text-align: left; width: 300px;">
                Serang, {{ $tanggal_sidang ?? '{$tanggal_sidang}' }}<br>
                Sekretaris Dewan Penguji,<br><br><br><br>
                <div class="line-name bold" style="margin-bottom: 0;">{{ $sekretaris_sidang ?? '{$sekretaris_sidang}' }}</div><br>
                NIP. {{ $nip_sekretaris_sidang ?? '' }}
            </div>
        </div>

        <div style="margin-top: 40px; font-size: 10pt;">
            )<sup>*</sup> Coret yang tidak perlu<br>
            <span class="underline bold">Keterangan:</span><br>
            <table style="border:none; line-height: 1.2; margin-top: 5px;">
                <tr><td style="width:120px;">&lt; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - 3,51</td><td>= Pujian</td></tr>
                <tr><td>3,01 &nbsp; - 3,50</td><td>= Sangat Memuaskan</td></tr>
                <tr><td>2,76 &nbsp; - 3,00</td><td>= Memuaskan</td></tr>
            </table>
        </div>
    </div>


    <!-- PAGE 4: REKAPITULASI NILAI UJIAN SKRIPSI -->
    <div class="page">
        <!-- HEADER -->
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

        <div class="doc-title">
            <span class="underline">REKAPITULASI NILAI UJIAN SKRIPSI</span>
        </div>

        <table class="bio-table">
            <tr>
                <td class="bio-label">Nama Mahasiswa</td>
                <td class="bio-colon">:</td>
                <td style="width: 350px;">{{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}</td>
                <td style="text-align: right;"><span class="checkbox-char">{!! $jk_L !!}</span> L | <span class="checkbox-char">{!! $jk_P !!}</span> P<sup>*</sup></td>
            </tr>
            <tr>
                <td>Tempat Tanggal Lahir</td>
                <td>:</td>
                <td colspan="2">{{ $tempat_lahir_mahasiswa ?? '{$tempat_lahir_mahasiswa}' }}, {{ $tanggal_lahir_mahasiswa ?? '{$tanggal_lahir_mahasiswa}' }}</td>
            </tr>
            <tr>
                <td>NIM / Jurusan</td>
                <td>:</td>
                <td colspan="2">{{ $nim ?? '{$nim}' }} /{{ $kode_prodi ?? '{$kode_prodi}' }}</td>
            </tr>
            <tr>
                <td>Tahun Akademik</td>
                <td>:</td>
                <td colspan="2">{{ $tahun_akademik ?? '{$tahun_akademik}' }} | Semester: {{ $semester_aktif ?? '{$semester_aktif}' }}</td>
            </tr>
            <tr>
                <td>Judul Skripsi</td>
                <td>:</td>
                <td colspan="2">{{ $judul_disetujui ?? '{$judul_disetujui}' }}</td>
            </tr>
        </table>

        <table class="tabel-nilai">
            <tr>
                <th rowspan="2" style="width: 30px;">No</th>
                <th rowspan="2">Penilai</th>
                <th colspan="2">Nilai</th>
                <th rowspan="2" style="width: 60px;">Kode<br>Nilai</th>
            </tr>
            <tr>
                <th style="width: 80px;">Huruf</th>
                <th style="width: 80px;">Angka</th>
            </tr>
            <tr><td class="center">1</td><td>Pembimbing I</td><td></td><td></td><td class="center">N<sup>1</sup></td></tr>
            <tr><td class="center">2</td><td>Pembimbing II</td><td></td><td></td><td class="center">N<sup>2</sup></td></tr>
            <tr><td class="center">3</td><td>Penguji I</td><td></td><td></td><td class="center">N<sup>3</sup></td></tr>
            <tr><td class="center">4</td><td>Penguji II</td><td></td><td></td><td class="center">N<sup>4</sup></td></tr>
            <tr><td colspan="4" class="center bold">JUMLAH NILAI</td><td class="center">NS</td></tr>
        </table>

        <div style="display: flex; align-items: center; margin-top: 20px; font-size: 11pt;">
            <div style="margin-right: 10px;">Nilai Skripsi (NS) = </div>
            <div class="fraction">
                <div class="numerator">N<sup>1</sup> + N<sup>2</sup> + N<sup>3</sup> + N<sup>4</sup></div>
                <div class="denominator">4</div>
            </div>
            <div style="margin: 0 10px;">=</div>
            <div class="fraction">
                <div class="numerator">....+ ....+ ....+ ....</div>
                <div class="denominator">4</div>
            </div>
            <div style="margin: 0 10px;">=</div>
            <div style="border: 1px solid black; width: 40px; height: 30px; display: inline-flex; align-items: center; justify-content: center; padding: 2px;">
                <div style="border: 1px dotted black; width: 100%; height: 100%; text-align: center;">........</div>
            </div>
        </div>

        <div class="center" style="margin-top: 25px; margin-bottom: 20px;">
            <span class="bold underline" style="font-size: 12pt;">NILAI AKHIR SKRIPSI</span>
            <table class="tabel-nilai" style="width: 250px; margin: 10px auto;">
                <tr><th colspan="2">Nilai Komulatif</th></tr>
                <tr><th>ANGKA</th><th>HURUF</th></tr>
                <tr><td style="height: 30px;"></td><td></td></tr>
            </table>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 15px;">
            <div style="text-align: left; width: 300px;">
                Serang, {{ $tanggal_sidang ?? '{$tanggal_sidang}' }}<br>
                Ketua,<br><br><br><br>
                <div class="line-name bold" style="margin-bottom: 0;">{{ $ketua_sidang ?? '{$ketua_sidang}' }}</div><br>
                NIP. {{ $nip_ketua_sidang ?? '' }}
            </div>
        </div>

        <div style="margin-top: 20px; font-size: 10pt;">
            )<sup>*</sup> Coret yang tidak perlu<br>
            <span class="underline bold">Keterangan Nilai Taksiran:</span>
            <table class="tabel-taksiran">
                <tr><th>No.</th><th>Nilai</th><th>Bobot</th><th>Komulatif</th></tr>
                <tr><td>1.</td><td>A</td><td>95 &ndash; 100</td><td>4,00</td></tr>
                <tr><td>2.</td><td>A-</td><td>90 &ndash; 94</td><td>3,75</td></tr>
                <tr><td>3.</td><td>B+</td><td>85 &ndash; 89</td><td>3,50</td></tr>
                <tr><td>4.</td><td>B</td><td>80 &ndash; 84</td><td>3,25</td></tr>
                <tr><td>5.</td><td>B-</td><td>75 &ndash; 79</td><td>3,00</td></tr>
                <tr><td>6.</td><td>C+</td><td>70 &ndash; 74</td><td>2,75</td></tr>
                <tr><td>7.</td><td>C</td><td>65 &ndash; 69</td><td>2,50</td></tr>
            </table>
        </div>
    </div>


    <!-- PAGE 5: NILAI UJIAN SKRIPSI -->
    @php
        $tim_penilai = [
            ['role' => 'Pembimbing I', 'nama' => $pembimbing_1 ?? '{$pembimbing_1}', 'nip' => $nip_pembimbing_1 ?? ''],
            ['role' => 'Pembimbing II', 'nama' => $pembimbing_2 ?? '{$pembimbing_2}', 'nip' => $nip_pembimbing_2 ?? ''],
            ['role' => 'Penguji I', 'nama' => $penguji_1 ?? '{$penguji_1}', 'nip' => $nip_penguji_1 ?? ''],
            ['role' => 'Penguji II', 'nama' => $penguji_2 ?? '{$penguji_2}', 'nip' => $nip_penguji_2 ?? ''],
        ];
    @endphp

    @foreach($tim_penilai as $penilai)
    <div class="page">
        <!-- HEADER -->
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

        <div class="doc-title">
            <span class="underline">NILAI UJIAN SKRIPSI</span>
        </div>

        <table class="bio-table">
            <tr>
                <td class="bio-label">Nama Mahasiswa</td>
                <td class="bio-colon">:</td>
                <td style="width: 350px;">{{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}</td>
                <td style="text-align: right;"><span class="checkbox-char">{!! $jk_L !!}</span> L | <span class="checkbox-char">{!! $jk_P !!}</span> P<sup>*</sup></td>
            </tr>
            <tr>
                <td>Tempat Tanggal Lahir</td>
                <td>:</td>
                <td colspan="2">{{ $tempat_lahir_mahasiswa ?? '{$tempat_lahir_mahasiswa}' }}, {{ $tanggal_lahir_mahasiswa ?? '{$tanggal_lahir_mahasiswa}' }}</td>
            </tr>
            <tr>
                <td>NIM / Jurusan</td>
                <td>:</td>
                <td colspan="2">{{ $nim ?? '{$nim}' }} /{{ $kode_prodi ?? '{$kode_prodi}' }} &nbsp;&nbsp;|&nbsp; <span class="checkbox-char">{!! $prodi_FA !!}</span> FA <span class="checkbox-char">{!! $prodi_IAT !!}</span> IAT <span class="checkbox-char">{!! $prodi_IH !!}</span> IH<sup>*</sup></td>
            </tr>
            <tr>
                <td>Tahun Akademik</td>
                <td>:</td>
                <td colspan="2">{{ $tahun_akademik ?? '{$tahun_akademik}' }} | Semester: {{ $semester_aktif ?? '{$semester_aktif}' }}</td>
            </tr>
            <tr>
                <td>Judul Skripsi</td>
                <td>:</td>
                <td colspan="2">{{ $judul_disetujui ?? '{$judul_disetujui}' }}</td>
            </tr>
        </table>

        <table class="tabel-nilai">
            <tr>
                <th style="width: 30px;">No</th>
                <th>Aspek yang dinilai</th>
                <th style="width: 60px;">Nilai</th>
                <th style="width: 80px;">Bobot Nilai</th>
            </tr>
            <tr style="background-color: #e0e0e0;">
                <td class="center">1.</td>
                <td class="bold">Aspek Naskah Skripsi</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td></td><td>a. Bahasa</td><td></td><td class="center">1-10 point</td>
            </tr>
            <tr>
                <td></td><td>b. Metodologi Penelitian</td><td></td><td class="center">1-30 point</td>
            </tr>
            <tr>
                <td></td><td>c. Analisis Data & Temuan Penelitian</td><td></td><td class="center">1-20 point</td>
            </tr>
            <tr style="background-color: #e0e0e0;">
                <td class="center">2.</td>
                <td class="bold">Aspek Ujian Skripsi</td>
                <td></td>
                <td></td>
            </tr>
            <tr>
                <td></td><td>a. Penguasaan Materi</td><td></td><td class="center">1-20 point</td>
            </tr>
            <tr>
                <td></td><td>b. Penguasaan Metodologi</td><td></td><td class="center">1-10 point</td>
            </tr>
            <tr>
                <td></td><td>c. Kemampuan Berargumentasi</td><td></td><td class="center">1-10 point</td>
            </tr>
            <tr>
                <td colspan="2" class="center bold">JUMLAH NILAI=NILAI AKHIR SKRIPSI</td>
                <td rowspan="2" style="padding: 2px;">
                    <div style="border: 1px solid black; width: 100%; height: 100%; min-height: 40px;"></div>
                </td>
                <td rowspan="2" class="center">1-100 point</td>
            </tr>
            <tr>
                <td colspan="2" style="padding: 0;">
                    <table style="width: 100%; border-collapse: collapse; text-align: center; font-weight: bold;">
                        <tr>
                            <td style="border-right: 1px solid black; width: 16.6%; padding: 5px;">A</td>
                            <td style="border-right: 1px solid black; width: 16.6%; padding: 5px;">A-</td>
                            <td style="border-right: 1px solid black; width: 16.6%; padding: 5px;">B+</td>
                            <td style="border-right: 1px solid black; width: 16.6%; padding: 5px;">B</td>
                            <td style="border-right: 1px solid black; width: 16.6%; padding: 5px;">B-</td>
                            <td style="width: 16.6%; padding: 5px;">C+</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <div style="text-align: left; width: 300px;">
                Serang, {{ $tanggal_sidang ?? '{$tanggal_sidang}' }}<br>
                {{ $penilai['role'] }},<br><br><br><br>
                <div class="line-name bold" style="margin-bottom: 0;">{{ $penilai['nama'] }}</div><br>
                NIP. {{ $penilai['nip'] }}
            </div>
        </div>

        <div style="margin-top: 15px; font-size: 10pt;">
            )<sup>*</sup> Coret yang tidak perlu<br>
            <span class="underline bold">Keterangan Nilai Taksiran:</span>
            <table class="tabel-taksiran">
                <tr><th>No.</th><th>Nilai</th><th>Bobot</th><th>Komulatif</th></tr>
                <tr><td>1.</td><td>A</td><td>95 &ndash; 100</td><td>4,00</td></tr>
                <tr><td>2.</td><td>A-</td><td>90 &ndash; 94</td><td>3,75</td></tr>
                <tr><td>3.</td><td>B+</td><td>85 &ndash; 89</td><td>3,50</td></tr>
                <tr><td>4.</td><td>B</td><td>80 &ndash; 84</td><td>3,25</td></tr>
                <tr><td>5.</td><td>B-</td><td>75 &ndash; 79</td><td>3,00</td></tr>
                <tr><td>6.</td><td>C+</td><td>70 &ndash; 74</td><td>2,75</td></tr>
                <tr><td>7.</td><td>C</td><td>65 &ndash; 69</td><td>2,50</td></tr>
            </table>
        </div>
    </div>
    @endforeach

</body>
</html>
