const fs = require('fs');


// // without character encoding command
// fs.readFile('./Input/text.txt', (err, data) => {
//   if (err) {
//     console.log('Error reading file:', err);
//     return;
//   }

//   console.log('File content:');
//   console.log(data.toString());
// });

// using character encoding no need for toStiong ()
fs.readFile('./Input/text.txt', 'utf8', (err, data) => {
  if (err) {
    console.log('Error reading file:', err);
    return;
  }

  console.log('File content:');
  console.log(data);
});


fs.writeFile('./Input/text.txt', 'Hello from Node.js!', (err) => {
  if (err) {
    console.log('Error writing file:', err);
    return;
  }

  console.log('File written successfully!');
});