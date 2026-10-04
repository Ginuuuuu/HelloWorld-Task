const fs = require('fs');

const exp = require('express');

const app = exp();

app.listen(3040);

// sending lines
app.get('/', (req, res) => {
    res.status(200).send('<h1>Hey broiii</h1>');
});

// sending files
app.get('/home', (req, res) => {
    res.sendFile('./HTML files/home.html', {root: __dirname});
});

app.get('/iphone', (req, res) => {
    res.sendFile('./HTML files/Iphone.html', {root: __dirname});
});

// redirecting url
app.get('/veedu', (req, res) => {
    res.redirect('/home');
})

// for unknown url || this will not check the url it will simply give response, so add it in the last condition, it is a non-conditional function
app.use((req, res) => {
    res.sendFile('./HTML files/notFound.html', {root: __dirname});
})