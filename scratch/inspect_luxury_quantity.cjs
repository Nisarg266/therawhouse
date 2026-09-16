const fs = require('fs');
const css = fs.readFileSync('assets/luxury-ui-engine.css', 'utf8');

// Find all rules containing quantity
const regex = /([^{}]+)\{([^{}]+)\}/g;
let match;
while ((match = regex.exec(css)) !== null) {
  const selector = match[1].trim();
  const body = match[2].trim();
  if (selector.toLowerCase().includes('quantity')) {
    console.log('SELECTOR:', selector.replace(/\s+/g, ' '));
    console.log('BODY:', body.replace(/\s+/g, ' '));
    console.log('---');
  }
}
