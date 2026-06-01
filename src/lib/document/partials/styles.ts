export const PAGE_CSS = `
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

@media print {
  body { background: none; }
  .page {
    margin: 0;
    box-shadow: none !important;
    padding: 25mm 25mm 25mm 25mm;
    width: 210mm;
    height: 297mm;
  }
}
`;

export const HEADER_CSS = `
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
  width: 100px;
  text-align: left;
  vertical-align: middle;
}

.header-logo img {
  width: 100px;
  height: auto;
  max-width: 100%;
  display: block;
}

.header-text {
  text-align: center;
}

.kop-1 { font-size: 13pt; font-weight: bold; margin: 0; }
.kop-2 { font-size: 12pt; font-weight: bold; margin: 0; }
.kop-3 { font-size: 14pt; font-weight: bold; margin: 0; }
.kop-4 { font-size: 9pt; margin: 0; margin-bottom: 5px; }
`;

export const FOOTER_CSS = `
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
  text-align: center;
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
`;

export const SIGNATURE_CSS = `
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
`;
