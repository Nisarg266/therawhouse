const fs = require('fs');

async function check() {
  const res = await fetch('http://127.0.0.1:9293/products/the-chakki');
  const html = await res.text();
  const recIndex = html.indexOf('product-recommendations');
  const brandIndex = html.indexOf('brand-manifesto');
  console.log('Rec index:', recIndex, 'Brand index:', brandIndex);
  if (recIndex !== -1 && brandIndex !== -1) {
    console.log('--- HTML BETWEEN REC AND BRAND ---');
    console.log(html.substring(brandIndex - 500, brandIndex + 400));
  }
}

check().catch(console.error);
