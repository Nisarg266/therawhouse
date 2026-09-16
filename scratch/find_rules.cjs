const fs = require('fs');
const lines = fs.readFileSync('assets/luxury-ui-engine.css', 'utf8').split('\n');
const terms = ['accelerated-checkout', 'concierge', 'micro-trust', 'accordion', 'product-form-buttons', 'buy-buttons'];
lines.forEach((line, idx) => {
  for (const t of terms) {
    if (line.toLowerCase().includes(t.toLowerCase())) {
      console.log(`Line ${idx + 1} [${t}]: ${line.trim()}`);
      break;
    }
  }
});
