const http = require('http');

http.get('http://127.0.0.1:9293/products/hikari', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const sIndex = data.indexOf('<sticky-add-to-cart');
    if (sIndex !== -1) {
      console.log('Sticky bar HTML:\n', data.substring(sIndex, sIndex + 1200));
    } else {
      console.log('No <sticky-add-to-cart tag found!');
    }
    
    // Check headings in recommendations
    const recMatches = data.match(/<h3[^>]*>[\s\S]*?<\/h3>/gi);
    console.log('H3 matches:', recMatches);
  });
});
