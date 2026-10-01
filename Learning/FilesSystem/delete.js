const fs = require('fs');

// // delete files
if ( fs.existsSync('./docs/hellowww.txt') ) {

    fs.unlink('./docs/hellowww.txt', (err) => {
        if (err)
            console.log(err.message)
        else
            console.log('File deleted');
    });

} else {
    console.log('File doesnt exist ');
}


// delete folder
fs.rmdir('./docs', (err) => {
    console.log(err.message);
});