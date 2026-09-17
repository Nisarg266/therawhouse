const http = require('http');

http.get('http://127.0.0.1:9292/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Check elements with inline styles or classes that might have fixed widths > 320px
    const fixedWidths = data.match(/style="[^"]*width:\s*[0-9]{3,4}px[^"]*"/gi) || [];
    console.log('Fixed widths in style attributes:', fixedWidths);
    
    // Check containers with min-width > 320px
    const minWidths = data.match(/style="[^"]*min-width:\s*[0-9]{3,4}px[^"]*"/gi) || [];
    console.log('Min widths in style attributes:', minWidths);
  });
});
