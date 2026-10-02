// simple senting HTML page as the response to the client



const http = require('http');
const fs = require('fs');


const server = http.createServer((req, res) => {
    console.log('Request Made');

    console.log(res.url);

    // let path = './HTML files/'
    // let path;

    // if (res.url == '/github') {
    //     path = 'GitHub'
    // } else if (res.url == '/iphone') {
    //     path = 'Iphone'
    // } else if (res.url == '/opsmonsters') {
    //     path = 'Opsmonsters'
    // } else if (res.url == '/devops') {
    //     path = 'DevOps'
    // } else if (res.url == '/hackathon') {
    //     path = 'Hackathon'
    // }

    fs.readFile(`./HTML files/GitHub.html`, (err, data) => {
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