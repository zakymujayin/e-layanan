export function renderFooter(qrcodeHtml: string): string {
  return `
    <div class="footer">
      <table class="footer-table">
        <tr>
          <td class="qrcode-cell">${qrcodeHtml}</td>
          <td class="footer-text">
            Dokumen ini diterbitkan secara elektronik melalui Sistem Informasi Layanan Akademik <br>
            Fakultas Ushuluddin dan Adab UIN Sultan Maulana Hasanuddin Banten.
          </td>
        </tr>
      </table>
    </div>`;
}
