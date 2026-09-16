const fs = require('fs');
const html = fs.readFileSync('scratch/strota_rendered.html', 'utf8');
console.log('Includes product-details:', html.includes('product-details'));
const matches = html.match(/class="[^"]*product-details[^"]*"/g) || [];
console.log('product-details matches:', matches);
