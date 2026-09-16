const http = require('http');

http.get('http://127.0.0.1:9293/products/the-chakki', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const buyButtons = d.match(/class="[^"]*buy-buttons-block[^"]*"[\s\S]*?(?=<div class="lux-product-concierge)/);
    if (buyButtons) {
      console.log('--- START OF BUY BUTTONS ---');
      console.log(buyButtons[0]);
    } else {
      console.log('Not found');
    }
  });
}).on('error', e => console.error(e));
