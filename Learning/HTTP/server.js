const http = require('http');

const server = http.createServer((req, res) => {
    console.log('Request Made');
    console.log(req.url);
    console.log(req.method);


    // senting plain text
    // res.setHeader('Response-Type', 'text/plain');
    // res.write('Hellowwwwww');
    // res.write('Hey buddy');
    // res.end();
    
    // setting header, with types | senting html page
    res.setHeader('Response-Type', 'text/html');
    res.write('<head rel = "script" href = ""></head>');
    res.write('<h1>Hellowwwwww</h1>');
    res.write('<h4>Hey buddy</h4>');
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