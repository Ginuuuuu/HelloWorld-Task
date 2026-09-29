const fs = require('fs');

const data = fs.readFileSync('./Input/text.txt', 'utf8');

console.log('2. File content:');
console.log(data);