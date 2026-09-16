const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('C:/Users/panch/.gemini/antigravity-ide/brain/a39dafa0-e056-4240-acc5-9d5a1f398b5c/.user_uploaded/media_1789576030853.png');
// PNG chunks: 8 bytes signature, then chunks: length (4), type (4), data (length), crc (4)
let offset = 8;
let idatBuffers = [];
let width, height, bitDepth, colorType;

while (offset < buf.length) {
  const len = buf.readUInt32BE(offset);
  const type = buf.toString('ascii', offset + 4, offset + 8);
  if (type === 'IHDR') {
    width = buf.readUInt32BE(offset + 8);
    height = buf.readUInt32BE(offset + 12);
    bitDepth = buf[offset + 16];
    colorType = buf[offset + 17];
  } else if (type === 'IDAT') {
    idatBuffers.push(buf.slice(offset + 8, offset + 8 + len));
  }
  offset += 12 + len;
}

const idat = Buffer.concat(idatBuffers);
const raw = zlib.inflateSync(idat);
console.log('Decoded raw length:', raw.length, 'width:', width, 'height:', height, 'bitDepth:', bitDepth, 'colorType:', colorType);

// Let's sample a horizontal row across the quantity selector box (e.g. y = 55)
// In colorType 6 (RGBA), each scanline is 1 filter byte + width * 4 bytes = 1 + 161*4 = 645 bytes
const stride = 1 + width * 4;
const y = 55;
const row = raw.slice(y * stride + 1, (y + 1) * stride);

// Print color along row y = 55
let lastColor = '';
for (let x = 0; x < width; x += 2) {
  const r = row[x * 4];
  const g = row[x * 4 + 1];
  const b = row[x * 4 + 2];
  const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  console.log(`x=${x}: ${hex}`);
}
