const fs = require('fs');
const path = require('path');

const votersPath = path.join(__dirname, 'scripts', 'voters.json');
if (fs.existsSync(votersPath)) {
  const voters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
  console.log('Total voters in JSON:', voters.length);
  console.log('Sample voters:', JSON.stringify(voters.slice(0, 10), null, 2));

  // Count by ward in JSON
  const counts = {};
  voters.forEach(v => {
    counts[v.ward] = (counts[v.ward] || 0) + 1;
  });
  console.log('Ward counts in JSON:', counts);
} else {
  console.log('voters.json not found!');
}
