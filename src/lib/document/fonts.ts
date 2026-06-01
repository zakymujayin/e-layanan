import fs from "fs";
import path from "path";

const BOOKMAN_FONT_PATH = path.join(
  process.cwd(),
  "public/fonts/bookman-old-style.ttf"
);

export function getBookmanFontFace(): string {
  if (fs.existsSync(BOOKMAN_FONT_PATH)) {
    const fontBuffer = fs.readFileSync(BOOKMAN_FONT_PATH);
    const fontBase64 = fontBuffer.toString("base64");
    return `
      @font-face {
        font-family: 'Bookman Old Style';
        src: url('data:font/truetype;base64,${fontBase64}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
    `;
  }
  return "";
}

export const BOOKMAN_FALLBACK_CSS = `
  body {
    font-family: 'Bookman Old Style', 'Bookman', 'URW Bookman L', 'Georgia', serif;
  }
`;
