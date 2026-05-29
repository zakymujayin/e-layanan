<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulir Seleksi Judul Skripsi</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }

        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 11pt;
            line-height: 1.3;
            color: #000;
            margin: 0;
            padding: 0;
            background-color: #525252;
        }

        .page {
            width: 210mm;
            min-height: 297mm;
            background: white;
            padding: 15mm 20mm 35mm 25mm; /* Padding bawah besar untuk footer */
            margin: 10mm auto;
            box-sizing: border-box;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            position: relative; /* Penting untuk footer absolute */
        }

        @media print {
            body { background: none; }
            .page { margin: 0; box-shadow: none; }
        }

               /* Header Styles */
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

        /* Document Metadata */
        .meta-table { width: 100%; margin: 15px 0; }
        .meta-table td { vertical-align: top; padding: 1px 0; }

        .address-block { margin: 20px 0; }

        /* Content Body */
        .greeting { margin-bottom: 10px; }
        .student-data { margin-left: 0px; margin-bottom: 15px; }
        .student-data td { padding: 2px 0; }

        .judul-list { margin-top: 15px; width: 100%; border-collapse: collapse; }
        .judul-list td { padding: 5px 0; vertical-align: top; }
        .judul-no { width: 25px; }
        .judul-check { width: 100px; text-align: center; border: 1px solid #000; font-size: 9pt; }

        /* Signature Section */
        .sig-container { margin-top: 40px; width: 100%; }
        .sig-box { width: 45%; text-align: center; vertical-align: top; }
        .sig-space { height: 80px; }
        .sig-name { font-weight: bold; text-decoration: underline; margin-bottom: 0; }
        .sig-nip { 
                margin-top: 0; /* Menghilangkan jarak atas NIP agar menempel ke nama */
            }

        /* Mengatur spasi antar baris global agar lebih rapat seperti Word */
        p {
                margin: 0;
                padding: 0;
            }


        /* Footer */
        .footer {
            position: absolute;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            border-top: 1px solid #ccc;
            padding-top: 5px;
        }
        .footer-table { width: 100%; font-size: 8pt; color: #666; }
        .qrcode-img { width: 50px; height: 50px; }
    </style>
</head>
<body>

<div class="page">
    {{-- Header / Kop Surat --}}
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

    {{-- Meta Surat --}}
    <table class="meta-table">
        <tr>
            <td style="width: 60px;">Nomor</td><td style="width: 10px;">:</td><td>Istimewa</td>
        </tr>
        <tr>
            <td>Lamp.</td><td>:</td><td>-</td>
        </tr>
        <tr>
            <td>Perihal</td><td>:</td><td><strong>Pengajuan Judul</strong></td>
        </tr>
    </table>

    {{-- Alamat Tujuan --}}
    <div class="address-block">
        Kepada Yth.<br>
        Bapak Dekan Fakultas Ushuluddin dan Adab<br>
        c.q. Ketua Jurusan {{ $prodi ?? '-' }}<br>
        UIN Sultan Maulana Hasanuddin Banten<br>
        di-<br>
        &nbsp;&nbsp;&nbsp;&nbsp;Tempat
    </div>

    {{-- Isi Surat --}}
    <p class="greeting">Assalamu'alaikum Wr. Wb.</p>
    <p>Yang bertanda tangan di bawah ini :</p>
    
    <table class="student-data">
        <tr><td style="width: 150px;">Nama</td><td style="width: 15px;">:</td><td><strong>{{ $nama_mahasiswa ?? '-' }}</strong></td></tr>
        <tr><td>Nomor Induk / Semester</td><td>:</td><td>{{ $nim ?? '-' }} / {{ $semester_aktif ?? '-' }}</td></tr>
        <tr><td>Jurusan</td><td>:</td><td>{{ strtoupper($prodi ?? '-') }}</td></tr>
    </table>

    <p>Dengan ini, saya mohon kiranya Bapak menyetujui salah satu judul skripsi yang saya ajukan di bawah ini:</p>

    <table class="judul-list">
        @foreach(array_values($judul_list) as $i => $judul)
        <tr>
            <td class="judul-no">{{ $i + 1 }}.</td>
            <td>{{ $judul }}</td>
            <td style="width: 20px;"></td>
            <td class="judul-check">
                <div style="border: 1px solid #000; width: 15px; height: 15px; display: inline-block; margin-right: 5px; vertical-align: middle;"></div>
                <small>Setujui</small>
            </td>
        </tr>
        @endforeach
    </table>

    <p style="margin-top: 20px;">Demikian, atas perhatian Bapak saya ucapkan terima kasih.</p>

    {{-- Bagian Tanda Tangan --}}
    <table class="sig-container">
        <tr>
            <td class="sig-box">
                <p>Menyetujui,<br>Dosen Pembimbing Akademik,</p>
                <div class="sig-space"></div>
                <p class="sig-name">{{ $dosen ?? '{$dosen}' }}</p>
                <p>NIP. {{ $nip_dosen ?? '{$nip_dosen}' }}</p>
            </td>
            <td style="width: 10%;"></td>
            <td class="sig-box">
                <p>Serang, {{ \Carbon\Carbon::now()->translatedFormat('d/m/Y') }}<br>Hormat Saya,</p>
                <div class="sig-space"></div>
                <p class="sig-name">{{ $nama_mahasiswa ?? '{$nama_mahasiswa}' }}</p>
                <p>NIM. {{ $nim ?? '{$nim}' }}</p>
            </td>
        </tr>
    </table>

    {{-- Footer Otomatis (Tetap di Bawah) --}}
    <div class="footer">
        <table class="footer-table">
            <tr>
                <td style="width: 60px;">{!! $qrcode ?? '' !!}</td>
                <td>
                    <strong>BYPASS SYSTEM NOTICE:</strong><br>
                    Dokumen ini dihasilkan secara otomatis karena keterlambatan verifikasi sistem.<br>
                    Validitas dokumen ini bergantung pada tanda tangan basah Dosen PA.
                </td>
                <td style="text-align: right; vertical-align: bottom;">
                    Halaman 1 dari 1
                </td>
            </tr>
        </table>
    </div>
</div>

</body>
</html>