const http = require('http');

const server = http.createServer((req, res) => {
    console.log('Request Made');
    
    res.write('./Learning/Buffer & Stream/docs/buffer.txt');
    res.end();

});

server.listen(3030, 'localhost', () => {
    console.log('server is Listening');
});

// // simple listening
// http.createServer((req, res) => {
//     res.write('# Hello guyss');
//     res.end();
// }).listen(3012);