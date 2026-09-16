const fs = require('fs');

// Read PNG header
const buf = fs.readFileSync('C:/Users/panch/.gemini/antigravity-ide/brain/a39dafa0-e056-4240-acc5-9d5a1f398b5c/.user_uploaded/media_1789576030853.png');
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
console.log('User image dimensions:', width, 'x', height);
