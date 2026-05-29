<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Keputusan Pembimbing Skripsi</title>
    <style>
        @page {
            size: A4;
            margin: 5mm 15mm 15mm 20mm; /* Margin standar dokumen resmi */
        }

        body {
            font-family: "Bookman Old Style", "Bookman", serif;
            font-size: 10pt;
            line-height: 1.2;
            color: #000;
            margin: 0;
            padding: 0;
        }

        /* Container untuk tampilan layar */
        @media screen {
            body { background-color: #525252; padding: 20px; }
            .page {
                background: white;
                width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                padding: 15mm 15mm 15mm 20mm;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
        }

        /* Print mode - hapus padding karena margin sudah di @page */
        @media print {
            body { background: none; padding: 0; }
            .page {
                background: white;
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
                box-shadow: none;
            }
        }

        /* Logo Header */
        .header-logo {
            text-align: center;
            margin-bottom: 15px;
        }
        .header-logo img {
            width: clamp(80px, 10vw, 150px);
            height: auto;
            max-width: 100%;
        }

        /* Judul SK */
        .title-section {
            text-align: center;
            margin-bottom: 20px;
            text-transform: uppercase;
        }
        .title-section .nomor {
            font-weight: normal;
            text-transform: none;
            margin-top: 2px;
            display: block;
        }

        /* Tabel Utama (Layout Membaca, Menimbang, dsb) */
        .sk-table {
            width: 100%;
            border-collapse: collapse;
        }
        .sk-table td {
            vertical-align: top;
            padding-bottom: 2px;
        }

        
        .label-col {
            width: 110px;
            white-space: nowrap;
        }
        .sep-col {
            width: 20px;
            text-align: center;
        }
        .content-col {
            text-align: justify;
        }

        /* List numbering dalam kolom konten */
        ol {
            margin: 0;
            padding-left: 18px;
        }
        ol li {
            margin-bottom: 5px;
        }

        /* Sub-tabel a.n dan NIM */
        .sub-info {
            margin-top: 5px;
            margin-left: 0;
        }
        .sub-info td {
            padding-bottom: 0 !important;
        }

        /* Penutup */
        .closing {
            margin-top: 15px;
            text-align: justify;
        }

        /* Signature Block */
        .signature-wrapper {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
        }
        .signature-block {
            width: 300px;
            text-align: left;
        }
        .sig-space {
            height: 70px;
        }

        .clear { clear: both; }
        .bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="page">
        {{-- Logo Atas --}}
        <div class="header-logo">
            @php
                $logoPath = \App\Models\AppSetting::get('header_logo') ?? \App\Models\AppSetting::get('qrcode_logo');
                $logoSrc = $logoPath ? \Illuminate\Support\Facades\Storage::disk('public')->url($logoPath) : asset('images/logo_uin.png');
            @endphp
            <img src="{{ $logoSrc }}" alt="Logo UIN">
        </div>

        {{-- Judul --}}
        <div class="title-section">
            SURAT KEPUTUSAN REKTOR UIN SULTAN MAULANA HASANUDDIN BANTEN<br>
            <span class="nomor">Nomor : {{ $nomor_surat ?? '455/Un.17/F.III.1/KP.01.2/04/2018' }}</span>
            TENTANG<br>
            PENGANGKATAN DOSEN PEMBIMBING SKRIPSI<br>
            FAKULTAS USHULUDDIN DAN ADAB UIN SULTAN MAULANA HASANUDDIN BANTEN<br>
            TAHUN AKADEMIK {{ $tahun_akademik ?? '2025/2026' }}<br>
            DENGAN RAHMAT TUHAN YANG MAHA ESA<br>
            REKTOR UNIVERSITAS ISLAM NEGERI SULTAN MAULANA HASANUDDIN BANTEN
        </div>

        <table class="sk-table">
            {{-- MEMBACA --}}
            <tr>
                <td class="label-col">MEMBACA</td>
                <td class="sep-col">:</td>
                <td class="content-col">
                    Surat Ketua Jurusan {{ $kode_prodi ?? 'IH' }} Nomor: {{ $nomor_srt_jurusan ?? '....' }} tanggal {{ $tgl_srt_jurusan ?? '....' }} tentang permohonan persetujuan Pembimbing Utama dan Pembimbing Pembantu untuk Mahasiswa:
                    
                    <table class="sub-info">
                        <tr>
                            <td style="width: 40px;">A.n.</td>
                            <td style="width: 15px;">:</td>
                            <td class="bold">{{ $nama_mahasiswa ?? 'Aini Fitri Utami' }}</td>
                        </tr>
                        <tr>
                            <td>NIM</td>
                            <td>:</td>
                            <td class="bold">{{ $nim ?? '143700015' }} / {{ $nama_prodi ?? 'Ilmu Hadis' }}</td>
                        </tr>
                    </table>
                </td>
            </tr>

            {{-- MENIMBANG --}}
            <tr>
                <td class="label-col">MENIMBANG</td>
                <td class="sep-col">:</td>
                <td class="content-col">
                    <ol>
                        <li>Bahwa untuk menyelesaikan Ujian Sarjana bagi Mahasiswa Fakultas Ushuluddin dan Adab Universitas Islam Negeri Sultan Maulana Hasanuddin Banten perlu ditunjuk Pembimbing;</li>
                        <li>Bahwa Mahasiswa tersebut perlu memperoleh bimbingan yang sebaik-baiknya dalam menyelesaikan Skripsi, sehingga dapat menyelesaikan studi kesarjanaannya;</li>
                        <li>Bahwa Saudara/i <b>{{ $pembimbing_1 ?? 'Dr. Sholahuddin Al Ayubi, M.A.' }}</b> dan Saudara/i <b>{{ $pembimbing_2 ?? 'Dr. H. Masrukhin Muhsin, Lc., M.A.' }}</b> masing-masing adalah Dosen Fakultas Ushuluddin dan Adab Universitas Islam Negeri Sultan Maulana Hasanuddin Banten yang telah memenuhi syarat untuk diangkat sebagai Pembimbing Utama dan Pembimbing Pembantu;</li>
                    </ol>
                </td>
            </tr>

            {{-- MENGINGAT --}}
            <tr>
                <td class="label-col">MENGINGAT</td>
                <td class="sep-col">:</td>
                <td class="content-col">
                    <ol>
                        <li>Undang-undang No. 20 Tahun 2003 tentang Sistem Pendidikan Nasional;</li>
                        <li>Undang-undang Nomor 12 Tahun 2012 tentang Pendidikan Tinggi;</li>
                        <li>Peraturan Pemerintah Nomor 32 Tahun 2013 tentang Standar Nasional Pendidikan;</li>
                        <li>Peraturan Pemerintah Nomor 4 Tahun 2014 tentang Penyelenggaraan Pendidikan Tinggi;</li>
                        <li>Peraturan Presiden Nomor 39 Tahun 2017 tentang Universitas Islam Negeri Sultan Maulana Hasanuddin Banten;</li>
                        <li>Peraturan Menteri Agama Nomor 32 Tahun 2017 tentang Statuta UIN Sultan Maulana Hasanuddin Banten;</li>
                        <li>Peraturan Menteri Agama Nomor 23 Tahun 2017 Tentang Organisasi dan Tata Kerja UIN Sultan Maulana Hasanuddin Banten;</li>
                        <li>Keputusan Rektor UIN Sultan Maulana Hasanuddin Banten No. 380/Un.17/B.III.2/KP.07.6/08/2025 tentang Pengangkatan Dekan Fakultas Ushuluddin dan Adab Masa Jabatan 2025-2029;</li>
                    </ol>
                </td>
            </tr>

            {{-- MENETAPKAN --}}
            <tr>
                <td class="label-col-menetapkan">MENETAPKAN</td>
                <td class="sep-col">:</td>
                <td class="content-col">
                    KEPUTUSAN REKTOR UNIVERSITAS ISLAM NEGERI SULTAN MAULANA HASANUDDIN BANTEN TENTANG PENGANGKATAN PEMBIMBING SKRIPSI FAKULTAS USHULUDDIN DAN ADAB UIN SULTAN MAULANA HASANUDDIN BANTEN TAHUN ANGGARAN {{ date('Y') }}.
                </td>
            </tr>

            {{-- KESATU --}}
            <tr>
                <td class="label-col-menetapkan">KESATU</td>
                <td class="sep-col">:</td>
                <td class="content-col">
                    Mengangkat Saudara/i <b>{{ $pembimbing_1 ?? 'Dr. Sholahuddin Al Ayubi, M.A.' }}</b> sebagai Pembimbing Utama dan Saudara/i <b>{{ $pembimbing_2 ?? 'Dr. H. Masrukhin Muhsin, Lc., M.A.' }}</b> sebagai Pembimbing Pembantu, bagi mahasiswa tersebut di atas dengan judul Skripsi: <b>"{{ $judul_disetujui ?? 'Penerapan Media Scramble Untuk Meningkatkan Minat Baca Dan Hasil Belajar Mata Pelajaran Bahasa Indonesia Materi Dongeng Siswa Kelas 3 SD Muhammadiyah Karangkajen II Yogyakarta' }}"</b>
                </td>
            </tr>

            {{-- KEDUA --}}
            <tr>
                <td class="label-col">KEDUA</td>
                <td class="sep-col">:</td>
                <td class="content-col">
                    Apabila dipandang perlu Pembimbing diberi kewenangan untuk mengubah redaksi judul, dengan ketentuan bila terdapat kekeliruan akan diadakan perubahan seperlunya.
                </td>
            </tr>

            {{-- KETIGA --}}
            <tr>
                <td class="label-col">KETIGA</td>
                <td class="sep-col">:</td>
                <td class="content-col">
                    Surat Keputusan ini berlaku terhitung mulai tanggal dikeluarkan, dengan ketentuan bila terdapat kekeliruan akan diadakan perubahan seperlunya.
                </td>
            </tr>
        </table>

        <div class="closing">
            Surat Keputusan ini diberikan kepada yang bersangkutan untuk dipergunakan sebagaimana mestinya.
        </div>

        <div class="signature-wrapper">
            <div class="signature-block">
                Ditetapkan di : Serang<br>
                Pada Tanggal : {{ \Carbon\Carbon::parse($tgl_sk ?? now())->translatedFormat('d F Y') }}<br>
                Dekan Fakultas Ushuluddin dan Adab,<br>
                <div class="sig-space">
                    {{-- Ruang TTD atau QR Code --}}
                    {!! $ttd ?? '' !!}
                </div>
                <b>{{ $dekan->nama ?? 'Dr. Masykur, S.Ag., M.Hum' }}</b><br>
                NIP. {{ $dekan->nip ?? '19760617 200501 1 003' }}
            </div>
        </div>
    </div>
</body>
</html>