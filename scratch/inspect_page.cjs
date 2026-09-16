const http = require('http');

http.get('http://127.0.0.1:9293/products/sinuous-vases', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const regex = /id="ProductInformation-[^"]*"[\s\S]*?(?=<footer|<section class="related|$)/;
    const match = data.match(regex);
    if (match) {
      console.log('--- PRODUCT DETAILS HTML (first 3000 chars) ---');
      console.log(match[0].substring(0, 3000));
    }
  });
}).on('error', e => console.error(e));
