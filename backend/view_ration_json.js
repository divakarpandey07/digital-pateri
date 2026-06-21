const fs = require('fs');
const path = require('path');

const rationPath = path.join(__dirname, 'scripts', 'ration_data.json');
if (fs.existsSync(rationPath)) {
  const cards = JSON.parse(fs.readFileSync(rationPath, 'utf8'));
  console.log('Total cards in JSON:', cards.length);
  console.log('Sample card 1:', JSON.stringify(cards[0], null, 2));
  console.log('Sample card 2:', JSON.stringify(cards[1], null, 2));
} else {
  console.log('ration_data.json not found!');
}
