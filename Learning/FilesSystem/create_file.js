const fs = require('fs');

if ( ! fs.existsSync('./docs')) {
    fs.mkdir('./docs', (err) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log('File Created');
        }
    })
}