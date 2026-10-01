const fs = require('fs');

fs.readFile('./Input/text.txt', 'utf-8', (err, data) => {
  if (err) {
    console.log('Error reading file:', err);
    return;
  }

  console.log('File content:');
  console.log(data);
});

fs.writeFile('./Input/output.txt', 'Hello from Node.js!', (err) => {
  if (err) {
    console.log('Error writing file:', err);
    return;
  }

  console.log('File written successfully!');
});