const fs = require('fs');

function checkCss(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (/(100vw|margin-inline:\s*-[0-9]|margin-left:\s*-[0-9]|margin-right:\s*-[0-9])/i.test(line)) {
      if (line.includes('max-width: 100vw') || line.includes('width: 100vw')) {
        // ok
      } else {
        console.log(`${file}:${i+1}: ${line.trim()}`);
      }
    }
  });
}

checkCss('assets/custom-header.css');
checkCss('assets/luxury-ui-engine.css');
checkCss('assets/luxp.css');
checkCss('assets/base.css');
