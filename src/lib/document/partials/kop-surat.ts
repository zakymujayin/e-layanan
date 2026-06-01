export function renderKopSurat(logoSrc: string): string {
  return `
    <table class="header-table double-line">
      <tr>
        <td class="header-logo">
          <img src="${logoSrc}" alt="Logo UIN" onerror="this.style.display='none'">
        </td>
        <td class="header-text">
          <p class="kop-1">KEMENTERIAN AGAMA REPUBLIK INDONESIA</p>
          <p class="kop-2">UNIVERSITAS ISLAM NEGERI</p>
          <p class="kop-2">SULTAN MAULANA HASANUDDIN BANTEN</p>
          <p class="kop-3">FAKULTAS USHULUDDIN DAN ADAB</p>
          <p class="kop-4">
            Jalan Syekh Nawawi Al Bantani Kp Andamui Sukawana Curug Kota Serang Banten 42171<br>
            Telepon (0254) 200323-208849 Faximile (0254) 200022<br>
            Website: <u>www.fuda.uinbanten.ac.id</u> E-mail: <u>surat@uinbanten.ac.id</u>
          </p>
        </td>
      </tr>
    </table>`;
}
