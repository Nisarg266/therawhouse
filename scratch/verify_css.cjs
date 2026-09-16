const fs = require('fs');
const css = fs.readFileSync('assets/luxury-ui-engine.css', 'utf8');

let opens = 0;
let closes = 0;
for (let i = 0; i < css.length; i++) {
  if (css[i] === '{') opens++;
  if (css[i] === '}') closes++;
}

console.log(`Opens: ${opens}, Closes: ${closes}, Balanced: ${opens === closes}`);
if (opens !== closes) {
  process.exit(1);
}
