const fs = require('fs');

fs.readFile('./Input/text.txt', 'utf8', (err, data) => {
  if (err) {
    console.log('Error:', err);
    return;
  }

  console.log('2. File content:');
  console.log(data);
});