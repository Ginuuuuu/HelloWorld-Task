//  Middleware will run between response and the server, 
// It's not mandatory to be sent response

const exp = require('express');

const app = exp();

app.use((req, res, next) => {
    console.log(res.path);
    console.log(req.host);
    next();
})

