const fs = require('fs');


// // ReadStream
// // instead ofg .toString() can use encoding utf8 also
const ReadStream = fs.createReadStream('./Learning/Buffer & Stream/docs/buffer.txt');

// stream.on('data', (buffer) => {
//     console.log('\n New Buffer \n');
//     console.log(buffer.toString());
// })



// writeStream

const writeStream = fs.createWriteStream('./Learning/Buffer & Stream/docs/copybuffer.txt')

// stream.on('data', (buffer) => {
//     writeStream.write('\n New Buffer \n');
//     writeStream.write(buffer);
// })



// simpler way to read and write
ReadStream.pipe(writeStream);