const fs = require('fs');
const zlib = require('zlib');

const buf = fs.readFileSync('C:/Users/panch/.gemini/antigravity-ide/brain/a39dafa0-e056-4240-acc5-9d5a1f398b5c/.user_uploaded/media_1789576030853.png');
let offset = 8;
let idatBuffers = [];
let width, height;

while (offset < buf.length) {
  const len = buf.readUInt32BE(offset);
  const type = buf.toString('ascii', offset + 4, offset + 8);
  if (type === 'IHDR') {
    width = buf.readUInt32BE(offset + 8);
    height = buf.readUInt32BE(offset + 12);
  } else if (type === 'IDAT') {
    idatBuffers.push(buf.slice(offset + 8, offset + 8 + len));
  }
  offset += 12 + len;
}

const idat = Buffer.concat(idatBuffers);
const raw = zlib.inflateSync(idat);

// Unfilter PNG
const bytesPerPixel = 4; // RGBA
const stride = width * bytesPerPixel;
const img = Buffer.alloc(width * height * 4);

let rawOffset = 0;
for (let y = 0; y < height; y++) {
  const filter = raw[rawOffset++];
  for (let x = 0; x < stride; x++) {
    const rawByte = raw[rawOffset++];
    const a = x >= bytesPerPixel ? img[(y * stride) + (x - bytesPerPixel)] : 0;
    const b = y > 0 ? img[((y - 1) * stride) + x] : 0;
    const c = (y > 0 && x >= bytesPerPixel) ? img[((y - 1) * stride) + (x - bytesPerPixel)] : 0;
    
    let val = 0;
    if (filter === 0) val = rawByte;
    else if (filter === 1) val = (rawByte + a) & 0xff;
    else if (filter === 2) val = (rawByte + b) & 0xff;
    else if (filter === 3) val = (rawByte + Math.floor((a + b) / 2)) & 0xff;
    else if (filter === 4) {
      const p = a + b - c;
      const pa = Math.abs(p - a);
      const pb = Math.abs(p - b);
      const pc = Math.abs(p - c);
      let pr = 0;
      if (pa <= pb && pa <= pc) pr = a;
      else if (pb <= pc) pr = b;
      else pr = c;
      val = (rawByte + pr) & 0xff;
    }
    img[(y * stride) + x] = val;
  }
}

// Now inspect row y = 55 across x = 20 to 145
const y = 55;
for (let x = 20; x < 145; x += 3) {
  const idx = (y * width + x) * 4;
  const r = img[idx];
  const g = img[idx + 1];
  const b = img[idx + 2];
  const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  console.log(`x=${x}: ${hex}`);
}
