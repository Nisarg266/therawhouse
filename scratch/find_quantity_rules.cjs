const fs = require('fs');

// We have the HTML in scratch/strota_rendered.html
// And stylesheets:
// 1. assets/base.css
// 2. assets/custom-header.css
// 3. assets/luxury-ui-engine.css
// 4. assets/art-buttons.css
// 5. scratch/compiled_styles.css

const cssFiles = [
  'assets/base.css',
  'assets/custom-header.css',
  'assets/luxury-ui-engine.css',
  'assets/art-buttons.css',
  'scratch/compiled_styles.css'
];

// Let's search for rules that mention quantity, minus, plus, button, or input in each file
cssFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  
  // Find all CSS rule blocks
  const ruleRegex = /([^{}]+)\{([^{}]+)\}/g;
  let match;
  while ((match = ruleRegex.exec(content)) !== null) {
    const selector = match[1].trim();
    const body = match[2].trim();
    
    // Check if selector could match quantity selector elements
    if (
      selector.includes('quantity') ||
      selector.includes('minus') ||
      (selector.includes('input') && (body.includes('border') || body.includes('background'))) ||
      (selector.includes('disabled') && (body.includes('border') || body.includes('background') || body.includes('outline')))
    ) {
      // Check if it sets border, background, or outline
      if (
        body.includes('border') ||
        body.includes('background') ||
        body.includes('box-shadow') ||
        body.includes('outline')
      ) {
        console.log(`[${file}] ${selector.replace(/\s+/g, ' ')}`);
        console.log(`    ${body.replace(/\s+/g, ' ')}`);
      }
    }
  }
});
