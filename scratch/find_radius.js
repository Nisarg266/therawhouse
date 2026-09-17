const fs = require('fs');
const content = fs.readFileSync('assets/custom-header.css', 'utf8');
content.split('\n').forEach((line, idx) => {
  if (/radius/i.test(line)) {
    console.log(`line ${idx + 1}: ${line.trim()}`);
  }
});
