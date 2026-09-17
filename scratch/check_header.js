const http = require('http');

http.get('http://127.0.0.1:9292/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const idx = data.indexOf('<header-drawer');
    if (idx !== -1) {
      console.log('--- 3000 to 1500 CHARS BEFORE HEADER DRAWER ---');
      console.log(data.slice(Math.max(0, idx - 3000), idx - 1400));
    }
  });
});
