const http = require('http');

http.get('http://127.0.0.1:9293/products/hikari', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const titleIndex = data.indexOf('productTitleLink');
    if (titleIndex !== -1) {
      console.log('Title block HTML:\n', data.substring(titleIndex - 100, titleIndex + 800));
    }
  });
});
