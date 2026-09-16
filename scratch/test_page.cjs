const http = require('http');
const fs = require('fs');

http.get('http://127.0.0.1:9292/products/strota-dining-chair-uf-dc-01', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    fs.writeFileSync('scratch/strota_rendered.html', d);
    const cssLinks = d.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/g) || [];
    console.log('CSS links count:', cssLinks.length);
    cssLinks.forEach(l => console.log('  LINK:', l));
    const styles = d.match(/<style[^>]*>[\s\S]*?<\/style>/g) || [];
    console.log('Style tags count:', styles.length);
    styles.forEach((s, idx) => {
      if (s.includes('quantity')) {
        console.log('Style tag with quantity #' + idx + ':\n' + s.substring(0, 400) + '...\n---');
      }
    });
  });
}).on('error', e => console.error(e));
