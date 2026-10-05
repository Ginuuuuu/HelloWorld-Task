//  Middleware will run between response and the server, 
// It's not mandatory to be sent response

const exp = require('express');

const app = exp();

// margon third-party middleware
const morgan = require('morgan');


// for switch the directoruy
const path = require('path');

app.listen(5000);


app.use(morgan('dev'));

app.use((req, res, next) => {
    // console.log(res.path);
    // console.log(req.host);
    console.log('MiddleWare 1');
    next();
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../HTTP/HTML files/home.html'));
})

app.get('/github', (req, res) => {
    res.sendFile(path.join(__dirname, '../HTTP/HTML files/GitHub.html'));
})

app.get('/iphone', (req, res) => {
    res.sendFile(path.join(__dirname, '../HTTP/HTML files/Iphone.html'));
})

app.get('/opsmonsters', (req, res) => {
    res.sendFile(path.join(__dirname, '../HTTP/HTML files/opsmonsters.html'));
})

app.use( (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../HTTP/HTML files/notFound.html'));
})

app.use((req, res) => {
    console.log('MiddleWare 2');
})