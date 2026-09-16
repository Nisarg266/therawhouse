const fs = require('fs');

async function check() {
  const res = await fetch('http://127.0.0.1:9293/products/hikari');
  const html = await res.text();
  const slideIndex = html.indexOf('<slideshow-component');
  if (slideIndex !== -1) {
    console.log('--- SLIDESHOW COMPONENT & PARENT ---');
    console.log(html.substring(slideIndex - 600, slideIndex + 1000));
  }
}

check().catch(console.error);
