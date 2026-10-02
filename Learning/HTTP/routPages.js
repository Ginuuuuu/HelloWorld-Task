// simple senting HTML page as the response to the client



const http = require('http');
const fs = require('fs');


const server = http.createServer((req, res) => {
    console.log('Request Made');

    console.log(req.url);

    let path = './HTML files/'

    if (req.url == '/github.html') {
        path += 'GitHub.html';
    } else if (req.url == '/iphone.html') {
        path += 'Iphone.html';
    } else if (req.url == '/opsmonsters.html') {
        path += 'Opsmonsters.html';
    } else if (req.url == '/devops.html') {
        path += 'DevOps.html';
    } else if (req.url == '/hackathons.html') {
        path += 'Hackathon.html';
    } else if (req.url == '/' || req.url == '/home') {
        path += 'home.html';
    } else if (req.url == '/veedu'){
        res.statusCode = '301';
        res.setHeader('Location', '/');
        res.end();
    } else {
        path += 'notFound.html';
        res.statusCode = 404;
    }

    fs.readFile(path, (err, data) => {
        if (err) {
            console.log(err.message);
            res.end();
        } else {
            // res.write(data);
            // res.end();
            res.end(data);
            console.log('File has written');
        }
    });
});

server.listen(3031, 'localhost', () => {
    console.log('Server listening.....');
});